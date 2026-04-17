const User = require("../models/User");

const getLeaderBoards = async (req, res) => {
  try {
    const hallOfFame = await User.find()
      .sort({ experiencePoints: -1 })
      .limit(10)
      .select("fullName experiencePoints");

    const monthlyArena = await User.find()
      .sort({ experiencePoints: -1 })
      .limit(10)
      .select("fullName experiencePoints");

    res.status(200).json({
      hallOfFame,
      monthlyArena,
    });
  } catch (err) {
    console.error("Error fetching leaderboards:", err);
    res
      .status(500)
      .json({ message: "Server error while fetching leaderboards." });
  }
};

module.exports = { getLeaderBoards };
