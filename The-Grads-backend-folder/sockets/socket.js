const { and, eq, sql } = require("drizzle-orm");
const { db } = require("../db/index.js");
const { generateSnowflake } = require("./snowflake.js");
const {
  messages,
  messageReactions,
  messageReactionCounts,
} = require("../db/schema.js");

/* ---------------- CONFIG ---------------- */

let BATCH_SIZE = 300;
const FLUSH_INTERVAL = 200;
const MAX_BUFFER = 7000;
const MAX_OUTBOUND_BATCH = 1000;
const MAX_CONCURRENT_FLUSHES = 2;
const PRESSURE_FLUSH_AGE = 150;

/* ---------------- STATE ---------------- */

const messageBuffer = new Map();
const WAL = new Map();
const presence = new Map();

let flushSemaphore = 0;
let lastFlush = Date.now();
let oldestMessageTime = Date.now();
let io; // Will be passed in from server.js

/* ---------------- outbound broadcast queue ---------------- */
const outboundQueue = [];
const OUTBOUND_FLUSH_INTERVAL = 5;

/* ---------------- 🔥 RECENT MESSAGE CACHE ---------------- */
const recentMessages = [];
const RECENT_LIMIT = 100;

function pushRecent(message) {
  recentMessages.push(message);
  if (recentMessages.length > RECENT_LIMIT) {
    recentMessages.shift();
  }
}

/* ---------------- Broadcast Flush ---------------- */

function broadcastBatch(batch) {
  if (batch.length === 0) return;
  io.to("global-chat").emit("new-message-batch", batch);
}

setInterval(() => {
  if (outboundQueue.length === 0) return;
  const batch = outboundQueue.splice(0, MAX_OUTBOUND_BATCH);
  broadcastBatch(batch);
}, OUTBOUND_FLUSH_INTERVAL);

/* ---------------- 🔥 THE FIXED SOCKET INIT 🔥 ---------------- */
// Instead of creating a NEW server, it accepts the one from server.js
function initChatSocket(socketIoInstance) {
  io = socketIoInstance;

  io.on("connection", (socket) => {
    /* realtime */
    socket.join("global-chat");

    if (process.env.NODE_ENV !== "production") {
      console.log("🟢 [TEXT CHAT] Socket Connected:", socket.id);
    }

    /* ---------- INITIAL PRESENCE PUSH ---------- */
    socket.emit("presence:update", {
      users: Array.from(presence.values()),
    });

    /* ---------- PRESENCE ONLINE ---------- */
    socket.on("presence:online", ({ userId, username }) => {
      socket.userId = userId;
      socket.username = username;

      presence.set(userId, {
        userId,
        username,
        status: "online",
      });

      socket.to("global-chat").emit("presence:update", {
        userId,
        username,
        status: "online",
      });
    });

    /* ---------- DISCONNECT ---------- */
    socket.on("disconnect", () => {
      if (socket.userId) {
        presence.delete(socket.userId);
        socket.to("global-chat").emit("presence:update", {
          userId: socket.userId,
          status: "offline",
        });
      }
    });

    /* ---------- SEND MESSAGE ---------- */
    socket.on("send-message", ({ userId, username, content }) => {
      if (io.engine.clientsCount > 2000) {
        socket.emit("server-busy");
        return;
      }

      const snowflakeId = generateSnowflake();
      const createdAt = new Date();

      const message = {
        socketId: socket.id,
        userId,
        snowflake: snowflakeId,
        username,
        content,
        createdAt,
      };

      const messagePayload = {
        ...message,
        createdAt: createdAt.toISOString(),
      };

      outboundQueue.push(messagePayload);
      pushRecent(messagePayload);

      const shardId = "global-chat";
      if (!messageBuffer.has(shardId)) {
        messageBuffer.set(shardId, []);
      }

      const shardBuffer = messageBuffer.get(shardId);
      if (shardBuffer.length >= MAX_BUFFER) {
        socket.emit("server-busy");
        return;
      }

      WAL.set(message.snowflake, message);
      shardBuffer.push(message);
      oldestMessageTime = Math.min(oldestMessageTime, createdAt.getTime());

      if (
        shardBuffer.length >= BATCH_SIZE ||
        Date.now() - oldestMessageTime > PRESSURE_FLUSH_AGE
      ) {
        flushMessages();
      }
    });

    /* ---------- TYPING ---------- */
    socket.on("typing:start", () => {
      socket.to("global-chat").volatile.emit("typing:start", {
        userId: socket.userId,
        username: socket.username,
      });
    });

    socket.on("typing:stop", () => {
      socket.to("global-chat").volatile.emit("typing:stop", socket.userId);
    });
  });
}

/* ---------------- DB FLUSH LOGIC ---------------- */
function adjustBatchSize() {
  const delta = Date.now() - lastFlush;
  if (delta < 50) BATCH_SIZE = Math.min(BATCH_SIZE * 2, 500);
  else if (delta > 200) BATCH_SIZE = Math.max(Math.floor(BATCH_SIZE / 2), 50);
  lastFlush = Date.now();
}

async function flushMessages() {
  if (flushSemaphore >= MAX_CONCURRENT_FLUSHES) return;
  const hasData = [...messageBuffer.values()].some((b) => b.length > 0);
  if (!hasData) return;

  flushSemaphore++;

  try {
    adjustBatchSize();

    for (const [shardId, shardBuffer] of messageBuffer.entries()) {
      if (shardBuffer.length === 0) continue;

      const batch = shardBuffer.splice(0, BATCH_SIZE);

      try {
        const inserted = await db
          .insert(messages)
          .values(
            batch.map((m) => ({
              userId: m.userId,
              snowflake: m.snowflake,
              username: m.username,
              content: m.content,
              createdAt: m.createdAt,
            })),
          )
          .returning({
            id: messages.id,
            snowflake: messages.snowflake,
          });

        const ackMap = new Map();
        const msgMap = new Map();

        for (const m of batch) {
          msgMap.set(m.snowflake.toString(), m);
        }

        for (const row of inserted) {
          const msg = msgMap.get(row.snowflake.toString());
          if (!msg) continue;

          if (!ackMap.has(msg.socketId)) {
            ackMap.set(msg.socketId, []);
          }
          ackMap.get(msg.socketId).push(row.snowflake.toString());
        }

        for (const [socketId, snowflakes] of ackMap) {
          io.to(socketId).emit("message:ack:batch", {
            snowflakes,
          });
        }

        for (const m of batch) {
          WAL.delete(m.snowflake.toString());
        }

        if (messageBuffer.get(shardId).length === 0) {
          oldestMessageTime = Date.now();
        }
      } catch (err) {
        console.error("🔴 [DB INSERT FAIL]", err.message);
        shardBuffer.unshift(...batch);
        break;
      }
    }
  } finally {
    flushSemaphore--;
  }
}

/* ---------------- INTERVAL FLUSH ---------------- */
setInterval(() => {
  let shouldFlush = false;

  if (messageBuffer.size > 0) {
    if (Date.now() - oldestMessageTime > PRESSURE_FLUSH_AGE) {
      shouldFlush = true;
    }
    for (const shard of messageBuffer.values()) {
      if (shard.length >= BATCH_SIZE) {
        shouldFlush = true;
        break;
      }
    }
  }

  if (shouldFlush) {
    flushMessages();
  }
}, FLUSH_INTERVAL);

// 🔥 Export the new init function name
module.exports = {
  messageBuffer,
  WAL,
  recentMessages,
  initChatSocket,
};
