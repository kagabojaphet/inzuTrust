// middleware/authMiddleware.js
const jwt  = require("jsonwebtoken");
const User = require("../model/userModel");

// ── Protect: verify JWT and attach user to req ────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token invalid",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

// ── Admin only ────────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Not authorized, admin access required",
  });
};

// ── Landlord only (landlord OR admin can pass) ────────────────────────────────
const landlordOnly = (req, res, next) => {
  if (req.user && (req.user.role === "landlord" || req.user.role === "admin")) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Not authorized, landlord access required",
  });
};

// ── Tenant only (tenant OR admin can pass) ────────────────────────────────────
const tenantOnly = (req, res, next) => {
  if (req.user && (req.user.role === "tenant" || req.user.role === "admin")) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Not authorized, tenant access required",
  });
};

module.exports = { protect, adminOnly, landlordOnly, tenantOnly };