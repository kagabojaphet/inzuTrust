// middleware/authMiddleware.js
const jwt  = require("jsonwebtoken");
const User = require("../model/userModel");

// ── Throttle cache: avoid writing lastSeenAt to DB on every single request ───
// Stores userId → last update timestamp (in-memory, resets on server restart)
const _seenCache = new Map();
const SEEN_THROTTLE_MS = 60 * 1000; // update at most once per minute per user

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

      // ── Update lastSeenAt (fire-and-forget, throttled to 1x per minute) ───
      // This is the ONLY addition to the original middleware.
      // It never blocks next() — runs in background, errors silently ignored.
      const now      = Date.now();
      const lastSeen = _seenCache.get(req.user.id) || 0;

      if (now - lastSeen > SEEN_THROTTLE_MS) {
        _seenCache.set(req.user.id, now);
        User.update(
          { lastSeenAt: new Date() },
          { where: { id: req.user.id } }
        ).catch(() => {}); // never blocks the request
      }
      // ─────────────────────────────────────────────────────────────────────

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
// Unchanged from original
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
// Unchanged from original
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
// Unchanged from original
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