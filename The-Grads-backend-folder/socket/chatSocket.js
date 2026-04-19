const { Server } = require("socket.io");
const { db } = require("../db/sql");
const { messages } = require("../db/schema");
const Snowflake = require("./snowflake");

let BATCH_SIZE = 30;
const FLUSH_INTERVAL = 200;
const MAX_BUFFER = 7000;
const MAX_OUTBOUND_BATCH = 1000;
const MAX_CONCURRENT_FLUSHES = 2;
const PRESSURE_FLUSH_AGE = 150;

const messageBuffer = new Map();
const WAL = new Map();
const presence = new Map();

let flushSemaphore = 0;
let lastFlush = Date.now();
let oldestMessageTime = Date.now();

const outboundQueue = [];

const recentMessages = [];
const RECENT_LIMIT = 100;

function pushRecent(message) {
  recentMessages.push(message);
  if (recentMessages.length > RECENT_LIMIT) {
    recentMessages.shift();
  }
}

const snowflakeGn = new Snowflake({
  datacenterId: 1,
  workerId: Number(process.env.WORKER_ID || 0),
});

function initChat(io) {
  setInterval(() => {
    if (outboundQueue.length === 0) return;

    const batch = outboundQueue.splice(0, MAX_OUTBOUND_BATCH);
    io.to("global-chat").emit("new-message-batch", batch);
  }, 5);

  io.on("connection", (socket) => {
    socket.join("global-chat");

    socket.emit("presence:update", {
      users: Array.from(presence.values()),
    });

    socket.on("presence:online", ({ userId, username }) => {
      socket.userId = userId;
      socket.username = username;

      presence.set(userId, { 
  userId, 
  username: username || "Unknown", 
  status: "online" 
});

      socket.to("global-chat").emit("presence:update", {
        userId,
        username,
        status: "online",
      });
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        presence.delete(socket.userId);

        socket.to("global-chat").emit("presence:update", {
          userId: socket.userId,
          status: "offline",
        });
      }
    });

    socket.on("send-message", ({ userId, username, content }) => {
      const snowflakeId = snowflakeGn.generate();
      const createdAt = new Date();

      const message = {
        socketId: socket.id,
        userId,
        username,
        content,
        snowflake: snowflakeId.toString(),
        createdAt,
      };

      const payload = {
        ...message,
        createdAt: createdAt.toISOString(),
      };

      outboundQueue.push(payload);
      pushRecent(payload);

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
        flushMessages(io);
      }
    });

    socket.on("typing:start", () => {
      socket.to("global-chat").emit("typing:start", {
        userId: socket.userId,
        username: socket.username,
      });
    });

    socket.on("typing:stop", () => {
      socket.to("global-chat").emit("typing:stop", socket.userId);
    });
  });
}

async function flushMessages(io) {
  if (flushSemaphore >= MAX_CONCURRENT_FLUSHES) return;

  flushSemaphore++;

  try {
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
            }))
          )
          .returning({
            id: messages.id,
            snowflake: messages.snowflake,
          });

        const ackMap = new Map();

        for (const row of inserted) {
          const msg = batch.find(
            (m) => m.snowflake === row.snowflake.toString()
          );

          if (!msg) continue;

          if (!ackMap.has(msg.socketId)) {
            ackMap.set(msg.socketId, []);
          }

          ackMap.get(msg.socketId).push(row.snowflake.toString());
        }

        for (const [socketId, snowflakes] of ackMap) {
          io.to(socketId).emit("message:ack:batch", { snowflakes });
        }

        for (const m of batch) {
          WAL.delete(m.snowflake);
        }
      } catch (err) {
        console.error("DB INSERT FAIL", err);
        shardBuffer.unshift(...batch);
        break;
      }
    }
  } finally {
    flushSemaphore--;
  }
}

setInterval(() => {
  flushMessages(global.ioInstance);
}, FLUSH_INTERVAL);

module.exports = {
  initChat,
  messageBuffer,
  recentMessages,
};