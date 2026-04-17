const express = require("express");
const router = express.Router();

const {
  createChallenge,
  getAllChallenges,
} = require("../controllers/challengeController");

const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

router.post(
  "/",
  verifyToken,
  authorizeRoles("MODERATOR", "ADMIN"),
  createChallenge,
);
router.get("/", verifyToken, getAllChallenges);

module.exports = router;
