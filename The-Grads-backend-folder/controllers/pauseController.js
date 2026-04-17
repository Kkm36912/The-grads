const User = require("../models/User");

const activatePause = async (req, res) => {
  try {
    const studentId = req.user.id;

    const { weeksToPause } = req.body;
    const user = await User.findById(studentId);

    if (!weeksToPause || weeksToPause < 1 || weeksToPause > 3) {
      return res
        .status(400)
        .json({ message: "You can only pause for 1 to 3 weeks at a time." });
    }
    if (user.learningPauses < weeksToPause) {
      return res.status(400).json({
        message: `Not enough tokens. You only have ${user.learningPauses} left.`,
      });
    }
    if (user.pauseStartDate) {
      return res
        .status(400)
        .json({ message: "You already have an active or scheduled pause!" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let daysLeftUntilMonday = (1 + 7 - today.getDay()) % 7;

    if (daysLeftUntilMonday === 0) {
      daysLeftUntilMonday = 7;
    }

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + daysLeftUntilMonday);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + weeksToPause * 7 - 1);

    // 4. CHARGE THE TOKEN AND SAVE THE VAULT
    user.learningPauses -= weeksToPause;
    user.pauseStartDate = startDate;
    user.pauseEndDate = endDate;

    await user.save();

    res.status(200).json({
      message: `Learning Pause activated! You are off the hook from ${startDate.toDateString()} to ${endDate.toDateString()}.`,
      learningPausesLeft: user.learningPauses,
      pauseStartDate: startDate,
      pauseEndDate: endDate,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error activating Learning Pause", error: err.message });
  }
};

module.exports = { activatePause };
