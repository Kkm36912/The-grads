# 🎓 The Grads (V2.0 Beta)
> **Elevating the engineering journey through gamified consistency and real-time community.**

[![Deploy Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)](https://the-grads.vercel.app)
[![Deploy Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)](https://the-grads.onrender.com)
[![Stack](https://img.shields.io/badge/Stack-MERN-blue?style=flat-square)](https://mongodb.com)

**The Grads** is a full-stack, gamified EdTech platform designed to transform the isolated experience of learning to code into a competitive, social, and addictive habit. Built on the MERN stack, it features a high-performance coding sandbox, real-time audio/text communication, and a deterministic growth engine.

---

## 🚀 Key Features

### ⚔️ The Arena (Coding & Aptitude)
- **Monaco Editor Integration:** A professional-grade code editor (the same engine as VS Code) for solving daily challenges.
- **Remote Execution Sandbox:** Securely compiles and executes Python/JavaScript code via the JDOODLE API.
- **Aptitude & Logic:** Specialized modules for quantitative and logical reasoning to prepare for technical interviews.

### 📈 Gamification Engine
- **Deterministic Daily Operations:** Uses a custom **Date-Seed Algorithm** to ensure every user globally receives the same challenge daily without database polling.
- **EXP & Streaks:** Earn experience points and maintain "Growth Cycles" to climb the **Global Leaderboard**.
- **Learning Pauses:** Strategic token system to protect streaks during exams or breaks.

### 💬 Community Hub
- **Query Forum:** Real-time text communication powered by **Socket.io**.
- **Audio Rooms:** Low-latency peer-to-peer voice collaboration using **Mediasoup (WebRTC SFU)**.
- **Real-time Leaderboard:** Instant rank updates as you solve problems.

### 🛡️ Admin Command Center
- **Performance Analytics:** High-level line graphs and success rate metrics for the entire platform.
- **Student Dossier:** Ability to monitor individual progress and manage user status (including permanent bans).
- **Question Forge:** Dynamic UI to create and push new challenges with hidden test cases.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Framer Motion, Lucide React.
- **Backend:** Node.js, Express.js, JWT Authentication.
- **Real-time:** Socket.io, Mediasoup.
- **Database:** MongoDB Atlas (Mongoose ODM).
- **Hosting:** Vercel (Frontend), Render (Backend).

---

## 📦 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas Account
- JDOODLE API Credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/the-grads.git](https://github.com/your-username/the-grads.git)
   cd the-grads
