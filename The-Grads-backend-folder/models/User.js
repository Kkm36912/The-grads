const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // User Details
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["STUDENT", "ADMIN", "MODERATOR"],
      default: "STUDENT",
    },

    //Gamification stats for Growth Cycle 1
    experiencePoints: {
      type: Number,
      default: 0,
    },

    monthlyExp: {
      type: Number,
      default: 0,
    },

    streak: {
      type: Number,
      default: 0,
    },

    lastSubmissionDate: {
      type: Date,
      default: null,
    },

    // Learning Pause featutre schema
    learningPauses: {
      type: Number,
      default: 1,
      max: 3,
    },

    pauseStartDate: {
      type: Date,
      default: null,
    },

    pauseEndDate: {
      type: Date,
      default: null,
    },

    lastPauseRefillDate: {
      type: Date,
      default: Date.now(),
    },
    // Add this inside your UserSchema
    solvedQuestions: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Challenge", // Links to your Challenge model!
        },
        language: {
          type: String, // e.g., "Python", "JavaScript", "C++"
          required: true,
        },
        solvedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }, //This automatically add the createdAt and updatedAt dates
);

module.exports = mongoose.model("User", userSchema);
