const User = require("../models/User");
const Challenge = require("../models/Challenge");
const Submission = require("../models/Submission");
// @route   GET /api/admin/students
// @desc    Get all students (with optional search)
// @route   GET /api/admin/students
const getStudents = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: "STUDENT" };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // 1. Fetch total from your real 30 seeded Challenges
    const totalPlatformQuestions = await Challenge.countDocuments();

    // 2. Fetch students AND populate with real Challenge data
    let students = await User.find(query)
      .select("-password")
      .populate("solvedQuestions.question")
      .sort({ createdAt: -1 });

    // 3. The Live Analytics Engine
    const enrichedStudents = students.map((student) => {
      let easy = 0,
        medium = 0,
        hard = 0;
      let languageTracker = {};

      if (student.solvedQuestions && student.solvedQuestions.length > 0) {
        student.solvedQuestions.forEach((sq) => {
          if (sq.question) {
            // 🔥 Match your Challenge schema's EXACT uppercase strings
            if (sq.question.difficulty === "EASY") easy++;
            if (sq.question.difficulty === "MEDIUM") medium++;
            if (sq.question.difficulty === "HARD") hard++;
          }
          if (sq.language) {
            languageTracker[sq.language] =
              (languageTracker[sq.language] || 0) + 1;
          }
        });
      }

      let primaryLang = "N/A";
      let maxUses = 0;
      for (const [lang, count] of Object.entries(languageTracker)) {
        if (count > maxUses) {
          maxUses = count;
          primaryLang = lang;
        }
      }

      return {
        ...student.toObject(),
        liveStats: { easy, medium, hard },
        primaryLanguage: primaryLang,
        totalSolved: student.solvedQuestions
          ? student.solvedQuestions.length
          : 0,
      };
    });

    res.status(200).json({
      students: enrichedStudents,
      totalQuestions: totalPlatformQuestions, // Now this will return exactly 30!
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error while fetching students" });
  }
};

// @route   DELETE /api/admin/students/:id
// @desc    Permanently delete a student
const deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(studentId);

    if (!deletedUser) {
      return res.status(404).json({ message: "Student not found" });
    }

    res
      .status(200)
      .json({ message: "Student permanently removed from database." });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Server error while deleting student" });
  }
};

const createQuestion = async (req, res) => {
  try {
    const {
      title,
      description,
      topic,
      difficulty,
      expReward,
      examples,
      testCases,
      starterCode,
    } = req.body;

    // 1. Better Validation
    if (!title || !description || !testCases || testCases.length === 0) {
      return res.status(400).json({
        message: "Missing required fields: Title, Description, or Test Cases.",
      });
    }

    // 2. Log it to see what's arriving (Debug)
    console.log("Forging new challenge for:", req.user.id || req.user._id);

    // 3. Create the Challenge
    const newChallenge = await Challenge.create({
      title,
      description,
      topic: topic || "Algorithms",
      difficulty: difficulty || "EASY",
      expReward: Number(expReward) || 10,
      examples: examples || [],
      testCases: testCases.map((tc) => ({
        input: tc.input,
        output: tc.output,
        isHidden: tc.isHidden || false,
      })),
      starterCode: starterCode || {
        python: "",
        javascript: "",
        cpp: "",
        java: "",
      },
    });

    res.status(201).json({
      message: "Arena Challenge forged successfully!",
      challenge: newChallenge,
    });
  } catch (error) {
    console.error("FORGE ERROR:", error); // Check your terminal for this!

    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A challenge with this title already exists!" });
    }

    res.status(500).json({
      message: "Server error while creating challenge",
      error: error.message, // This will tell us the EXACT problem in the alert box
    });
  }
};

// @route   GET /api/admin/questions
// @desc    Get all challenges for the Admin Question Log
const getQuestions = async (req, res) => {
  try {
    // Fetch all challenges and sort them by newest first
    const questions = await Challenge.find().sort({ createdAt: -1 });
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Server error while fetching questions" });
  }
};

// @route   GET /api/admin/analytics
// @desc    Get global platform stats and leaderboard
const getAnalytics = async (req, res) => {
  try {
    const studentCount = await User.countDocuments();
    const challengeCount = await Challenge.countDocuments();

    const challenges = await Challenge.find();
    let totalGlobalAttempts = 0;
    let totalGlobalSuccess = 0;

    challenges.forEach((c) => {
      totalGlobalAttempts += c.totalAttempts || 0;
      totalGlobalSuccess += c.successfulAttempts || 0;
    });

    const topStudents = await User.find()
      .select("fullName email experiencePoints streak")
      .sort({ experiencePoints: -1 })
      .limit(5);

    // =======================================
    // 🔥 NEW: GRAPH DATA ENGINE 🔥
    // =======================================
    const now = new Date();
    const firstDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    // Fetch all submissions from the last ~60 days
    const recentSubmissions = await Submission.find({
      createdAt: { $gte: firstDayLastMonth },
    });

    // Structure for our Recharts Line Graph
    const performanceData = [
      { name: "Week 1", currentMonth: 0, previousMonth: 0 },
      { name: "Week 2", currentMonth: 0, previousMonth: 0 },
      { name: "Week 3", currentMonth: 0, previousMonth: 0 },
      { name: "Week 4+", currentMonth: 0, previousMonth: 0 },
    ];

    recentSubmissions.forEach((sub) => {
      const date = new Date(sub.createdAt);
      const isCurrentMonth = date.getMonth() === now.getMonth();
      const day = date.getDate();

      // Bucket into weeks
      let weekIndex = 0;
      if (day > 7 && day <= 14) weekIndex = 1;
      else if (day > 14 && day <= 21) weekIndex = 2;
      else if (day > 21) weekIndex = 3;

      if (isCurrentMonth) {
        performanceData[weekIndex].currentMonth += 1;
      } else {
        performanceData[weekIndex].previousMonth += 1;
      }
    });

    res.status(200).json({
      studentCount,
      challengeCount,
      totalGlobalAttempts,
      totalGlobalSuccess,
      topStudents,
      performanceData, // Injecting the graph data!
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Server error while fetching analytics" });
  }
};

module.exports = {
  getStudents,
  deleteStudent,
  createQuestion,
  getQuestions,
  getAnalytics,
};
