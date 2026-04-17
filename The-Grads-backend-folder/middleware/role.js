const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No role found on user." }); // 401: Unauthorized
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: As a ${req.user.role}, you don't have permission to access this route.`,
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
