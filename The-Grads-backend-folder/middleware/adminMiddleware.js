const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
  try {
    // 1. Grab the header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No Auth Header found" });
    }

    // 2. Safely extract the token (no arrays, no splitting)
    const token = authHeader.replace("Bearer ", "").trim();

    // 3. THE FAILSAFE: If it's fake, undefined, or empty, bounce them immediately
    if (
      !token ||
      token === "undefined" ||
      token === "null" ||
      typeof token !== "string"
    ) {
      return res.status(401).json({ message: "Token format rejected" });
    }

    // 4. Verify the true string
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Admin Check
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "Access Denied: Admins Only" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("🔴 JWT Verify Blocked:", error.message);
    res.status(401).json({ message: "Session expired or invalid" });
  }
};

module.exports = { verifyAdmin };
