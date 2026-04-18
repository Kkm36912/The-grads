require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const { db } = require("./db/sql"); // ✅ FIXED

const verifyToken = require("./middleware/auth");
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes.js");
const challengeRoutes = require("./routes/challengeRoutes.js");
const submissionRoutes = require("./routes/submissionRoutes");
const pauseRoutes = require("./routes/pauseRoutes.js");
const leaderboardRoutes = require("./routes/leaderboardRoutes.js");
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require("./routes/messageRoutes");

const { initChat } = require("./socket/chatSocket");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

global.ioInstance = io; // ✅ IMPORTANT

// Routes
app.get("/", (req, res) => {
  res.send("Hello, The grads Backend");
});

app.use("/api", authRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/pause", pauseRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/dashboard", verifyToken, async (req, res) => {
  try {
    const fullUserProfile = await User.findById(req.user.id).select("-password");
    res.status(200).json({
      message: "Welcome to Growth Cycle 1",
      userData: fullUserProfile,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// Boot
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    initChat(io); // ✅ CRITICAL FIX

    // Neon anti-sleep
    setInterval(async () => {
      try {
        await db.execute({ sql: "SELECT 1" }); // ✅ FIXED
      } catch (err) {}
    }, 4 * 60 * 1000);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server boot failed:", err);
  }
}

startServer();