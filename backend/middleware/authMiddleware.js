// middleware/authMiddleware.js
const jwt  = require("jsonwebtoken");
const User = require("../model/userModel");

// ── Throttle lastSeenAt writes (max once per minute per user) ─────────────────
const _seenCache       = new Map();
const SEEN_THROTTLE_MS = 60 * 1000;

// ─── protect ─────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findByPk(decoded.id, { attributes: { exclude: ["password"] } });

    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    // Block suspended accounts immediately
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support.",
      });
    }

    req.user = user;

    // Throttled lastSeenAt update
    const now      = Date.now();
    const lastSeen = _seenCache.get(user.id) || 0;
    if (now - lastSeen > SEEN_THROTTLE_MS) {
      _seenCache.set(user.id, now);
      User.update({ lastSeenAt: new Date() }, { where: { id: user.id } }).catch(() => {});
    }

    next();
  } catch {
    return res.status(401).json({ success: false, message: "Not authorized, token invalid" });
  }
};

// ─── Role guards ──────────────────────────────────────────────────────────────

const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ success: false, message: "Admin access required" });
};

const landlordOnly = (req, res, next) => {
  if (req.user && ["landlord", "admin"].includes(req.user.role)) return next();
  return res.status(403).json({ success: false, message: "Landlord access required" });
};

// Agents AND landlords can use agent-facing routes (landlord can test their own agent views)
const agentOnly = (req, res, next) => {
  if (req.user && ["agent", "landlord", "admin"].includes(req.user.role)) return next();
  return res.status(403).json({ success: false, message: "Agent access required" });
};

const tenantOnly = (req, res, next) => {
  if (req.user && ["tenant", "admin"].includes(req.user.role)) return next();
  return res.status(403).json({ success: false, message: "Tenant access required" });
};

// ─── canManageProperty ────────────────────────────────────────────────────────
// Relationship-based: landlord owns it OR agent has an active assignment to it.
// Attaches req.agentPermissions for downstream requirePermission() checks.
// Reads propertyId from req.params.id or req.body.propertyId
const canManageProperty = async (req, res, next) => {
  try {
    const { Property, AgentProperty } = require("../model");
    const propertyId = req.params.id || req.body.propertyId;

    if (!propertyId) {
      return res.status(400).json({ success: false, message: "Property ID is required" });
    }

    const { role, id: userId } = req.user;

    if (role === "admin") return next();

    if (role === "landlord") {
      const owns = await Property.findOne({ where: { id: propertyId, landlordId: userId } });
      if (owns) return next();
    }

    if (role === "agent") {
      const assigned = await AgentProperty.findOne({
        where: { agentId: userId, propertyId, isActive: true },
      });
      if (assigned) {
        req.agentPermissions = {
          canEditDetails:       assigned.canEditDetails,
          canManageTenants:     assigned.canManageTenants,
          canViewPayments:      assigned.canViewPayments,
          canHandleMaintenance: assigned.canHandleMaintenance,
        };
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: "Access denied: you do not have permission to manage this property.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── requirePermission ────────────────────────────────────────────────────────
// Fine-grained guard. Must run AFTER canManageProperty.
// Usage: requirePermission("canEditDetails")
const requirePermission = (permission) => (req, res, next) => {
  if (req.user.role !== "agent") return next(); // landlords/admins always pass
  if (!req.agentPermissions?.[permission]) {
    return res.status(403).json({
      success: false,
      message: `You don't have the '${permission}' permission for this property.`,
    });
  }
  next();
};

module.exports = {
  protect,
  adminOnly,
  landlordOnly,
  agentOnly,
  tenantOnly,
  canManageProperty,
  requirePermission,
};