const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/authController.js");
const verifyToken = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);

// 3. 🟢 THE NEW ROUTE (Protected by middleware)
router.get("/auth/me", verifyToken, getUserProfile);

module.exports = router;
