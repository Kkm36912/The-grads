const express = require("express");
const router = express.Router();

const { createSubmission } = require("../controllers/submissionController");

const verifyToken = require("../middleware/auth.js");

router.post("/", verifyToken, createSubmission);

module.exports = router;
