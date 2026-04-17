const express = require("express");
const router = express.Router();
const {
  getStudents,
  deleteStudent,
  createQuestion,
  getQuestions,
  getAnalytics,
} = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/adminMiddleware"); // Importing the middleware

// The Routes
router.get("/students", verifyAdmin, getStudents);
router.delete("/students/:id", verifyAdmin, deleteStudent);
router.post("/questions", verifyAdmin, createQuestion);
router.get("/questions", verifyAdmin, getQuestions);
router.get("/analytics", verifyAdmin, getAnalytics);
module.exports = router;
