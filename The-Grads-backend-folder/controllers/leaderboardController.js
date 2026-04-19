const User = require("../models/User");

const getLeaderBoards = async (req, res) => {
  try {
    // 1. Fetch only STUDENTS for the Leaderboards
    const hallOfFame = await User.find({ role: "STUDENT" })
      .sort({ experiencePoints: -1 })
      .limit(10)
      .select("fullName experiencePoints");

    const monthlyArena = await User.find({ role: "STUDENT" })
      .sort({ monthlyExp: -1 }) // Assuming you want to sort by monthlyExp here!
      .limit(10)
      .select("fullName monthlyExp experiencePoints");

    // 2. Calculate the exact Global Rank for the logged-in user
    let globalRank = 0;
    if (req.user && req.user.id) {
      const currentUser = await User.findById(req.user.id);
      if (currentUser) {
        // Count how many students have MORE EXP than the current user, then add 1
        globalRank = await User.countDocuments({
          role: "STUDENT",
          experiencePoints: { $gt: currentUser.experiencePoints }
        }) + 1;
      }
    }

    res.status(200).json({
      hallOfFame,
      monthlyArena,
      globalRank // Sending the exact rank to the frontend!
    });
  } catch (err) {
    console.error("Error fetching leaderboards:", err);
    res.status(500).json({ message: "Server error while fetching leaderboards." });
  }
};

module.exports = { getLeaderBoards };