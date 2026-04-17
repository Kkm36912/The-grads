const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      default: "Algorithms",
    },
    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "EASY",
    },
    expReward: {
      type: Number,
      default: 10,
    },

    // ================= 1. FRONTEND UI EXAMPLES =================
    // These are displayed in the Problem Description panel
    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String }, // e.g., "Because 4 * 5 = 20"
      },
    ],

    // ================= 2. BACKEND JDOODLE GRADING =================
    // These are injected into the compiler.
    // Added 'isHidden' so you can have secret edge cases!
    testCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
      },
    ],

    // ================= 3. DYNAMIC STARTER CODE =================
    // Injected directly into the CodingArena editor
    starterCode: {
      python: { type: String },
      javascript: { type: String },
      cpp: { type: String },
      java: { type: String },
    },

    // ================= 4. ANALYTICS =================
    totalAttempts: {
      type: Number,
      default: 0,
    },
    successfulAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Challenge", challengeSchema);
