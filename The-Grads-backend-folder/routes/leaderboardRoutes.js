const express = require("express");
const router = express.Router();
const { getLeaderBoards } = require("../controllers/leaderboardController");
const verifyToken = require("../middleware/auth");

router.get("/", verifyToken, getLeaderBoards);

module.exports = router;
