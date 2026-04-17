require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

// 🔥 1. ADD THESE DRIZZLE IMPORTS
const { db } = require("./db"); // Ensure this path points to your Drizzle db config file
const { messages } = require("./db/schema"); // Ensure this path points to your schema.js
const { desc, lt } = require("drizzle-orm");

// --- Socket & WebRTC Imports ---
const { initMediasoup } = require("./sockets/mediasoup");
const { initVoiceNamespace } = require("./sockets/voice.socket");
// Note: If your teammate also had a socket.js file for TEXT chat, import and initialize it here too!

// --- Route Imports ---
const verifyToken = require("./middleware/auth");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes.js");
const challengeRoutes = require("./routes/challengeRoutes.js");
const submissionRoutes = require("./routes/submissionRoutes");
const pauseRoutes = require("./routes/pauseRoutes.js");
const leaderboardRoutes = require("./routes/leaderboardRoutes.js");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Create the HTTP server using Express
const server = http.createServer(app);

// 2. Attach Socket.IO with CORS allowing your React frontend
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vite frontend
    methods: ["GET", "POST"],
  },
});

// 3. Initialize your teammate's Namespaces
initVoiceNamespace(io);

// 🔥 2. ADD YOUR TEXT CHAT SOCKET INITIALIZATION HERE
// Example: Assuming your text chat file exports a function called initChatSocket
const { initChatSocket } = require("./sockets/socket.js");
initChatSocket(io);

// 4. Express Routes
app.get("/", (req, res) => {
  res.send("Hello, The grads Backend");
});
app.use("/api", authRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/pause", pauseRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Dashboard Route
app.get("/api/dashboard", verifyToken, async (req, res) => {
  try {
    const fullUserProfile = await User.findById(req.user.id).select(
      "-password",
    );
    res.status(200).json({
      message: "Welcome to Growth Cycle 1: Habitual Cycle!",
      userData: fullUserProfile,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// 🔥 3. ADD THE REAL POSTGRES CHAT HISTORY ROUTE HERE
app.get("/api/messages", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before;

    let query;

    if (before) {
      query = db
        .select()
        .from(messages)
        .where(lt(messages.snowflake, before))
        .orderBy(desc(messages.createdAt))
        .limit(limit);
    } else {
      query = db
        .select()
        .from(messages)
        .orderBy(desc(messages.createdAt))
        .limit(limit);
    }

    const msgs = await query;
    const chronologicalMsgs = msgs.reverse();

    res.json({
      messages: chronologicalMsgs,
      hasMore: msgs.length === limit,
    });
  } catch (error) {
    console.error("🔴 Failed to fetch messages:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// 5. The Master Boot Sequence
async function startServer() {
  try {
    // A. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // 🔥 THE ANTI-SLEEP PING (Keeps Neon awake while server runs)
    setInterval(
      async () => {
        try {
          await db.execute("SELECT 1");
        } catch (err) {
          // Silently catch errors if network blips
        }
      },
      4 * 60 * 1000,
    ); // Runs every 4 minutes

    // B. Initialize Mediasoup Workers (The Voice Engine)
    await initMediasoup();

    // C. Start listening on the attached HTTP server (This handles BOTH Express & Sockets)
    server.listen(PORT, () => {
      console.log(`🚀 The Grads Engine running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server boot failed:", err);
  }
}

// Ignite the engine
startServer();
