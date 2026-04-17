const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const { activatePause } = require("../controllers/pauseController");

router.post("/activate", verifyToken, activatePause);

module.exports = router;
