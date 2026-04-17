const Challenge = require("../models/Challenge");
const Submission = require("../models/Submission");
const createChallenge = async (req, res) => {
  try {
    const { title, description, difficulty, expReward, testCases } = req.body;
    // 2. The Sanity Check: Did the Moderator fill out all the required fields?
    if (!title || !description || !difficulty || !expReward || !testCases) {
      return res
        .status(400)
        .json({ message: "All fields are required to create a challenge." });
    }
    const newChallenge = new Challenge({
      title,
      description,
      difficulty,
      expReward,
      testCases,
    });

    await newChallenge.save();
    res.status(201).json({
      message: "Challenge created Successfully",
      challenge: newChallenge,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error creating challenge", error: err.message });
  }
};

// Your route controller function
const getAllChallenges = async (req, res) => {
  try {
    // 1. Fetch all available challenges
    const challenges = await Challenge.find({});

    // 2. Fetch all submissions for the CURRENT LOGGED-IN USER
    const userSubmissions = await Submission.find({ student: req.user.id });

    // 3. Stitch them together (UPGRADED: Finds the absolute best historical status)
    const challengesWithStatus = challenges.map((challenge) => {
      // Get ALL submissions this user made for this specific challenge
      const userChallengeSubs = userSubmissions.filter(
        (sub) => sub.challenge.toString() === challenge._id.toString(),
      );

      // Find the absolute best status they ever achieved
      let bestStatus = "Unsolved";
      if (userChallengeSubs.length > 0) {
        // If they passed it even once, it's PASSED forever.
        if (userChallengeSubs.some((sub) => sub.status === "PASSED")) {
          bestStatus = "PASSED";
        }
        // Otherwise, if they got partial, it's PARTIAL.
        else if (userChallengeSubs.some((sub) => sub.status === "PARTIAL")) {
          bestStatus = "PARTIAL";
        }
        // Otherwise, they only ever failed.
        else {
          bestStatus = "Attempted";
        }
      }

      // Convert Mongoose document to plain JS object so we can add properties
      const challengeObj = challenge.toObject();
      challengeObj.userStatus = bestStatus; // Attach the BEST status

      return challengeObj;
    });

    // 4. Send the stitched data back to the frontend
    res.status(200).json(challengesWithStatus);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ message: "Server error fetching challenges." });
  }
};
module.exports = { createChallenge, getAllChallenges };
