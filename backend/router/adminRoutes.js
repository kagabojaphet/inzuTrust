// router/adminRoutes.js
const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { Op, fn, col, literal } = require("sequelize");

const getDb = () => require("../model");
const { log } = require("../services/auditLogService");

// ── Audit helper: builds actor + ip/ua from req ───────────────────────────────
const fromReq = (req) => ({
  actorId:   req.user?.id    || null,
  actorName: req.user ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() : "System",
  actorRole: req.user?.role  || "system",
  sourceIp:  req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || null,
  userAgent: req.headers["user-agent"] || null,
});

// ═══════════════════════════════════════════════════════
//  DASHBOARD STATS
// ═══════════════════════════════════════════════════════
router.get("/dashboard/stats", protect, adminOnly, async (req, res) => {
  try {
    const db = getDb();
    const [
      totalUsers, landlords, tenants,
      totalProperties, activeAgreements,
      totalVolume, openDisputes, resolvedDisputes,
    ] = await Promise.all([
      db.User.count(),
      db.User.count({ where: { role: "landlord" } }),
      db.User.count({ where: { role: "tenant"   } }),
      db.Property.count(),
      db.Agreement.count({ where: { status: "signed" } }),
      db.Payment.sum("amount", { where: { status: "paid" } }),
      db.Dispute.count({ where: { status: { [Op.in]: ["open","under_review","mediation"] } } }),
      db.Dispute.count({ where: { status: "resolved" } }),
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueChart = await db.Payment.findAll({
      where:      { status: "paid", paidAt: { [Op.gte]: sixMonthsAgo } },
      attributes: [
        [fn("DATE_FORMAT", col("paidAt"), "%Y-%m"), "month"],
        [fn("SUM", col("amount")), "revenue"],
      ],
      group: [literal("DATE_FORMAT(`paidAt`, '%Y-%m')")],
      order: [[literal("DATE_FORMAT(`paidAt`, '%Y-%m')"), "ASC"]],
      raw:   true,
    }).catch(() => []);

    return res.json({
      success: true,
      data: {
        stats: { totalUsers, landlords, tenants, totalProperties, activeAgreements, totalVolume: totalVolume || 0, openDisputes, resolvedDisputes },
        revenueChart,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════
//  USERS
// ═══════════════════════════════════════════════════════
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const { User, TenantProfile, LandlordProfile } = getDb();
    const { search = "", role = "all", status = "all", page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where  = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName:  { [Op.like]: `%${search}%` } },
        { email:     { [Op.like]: `%${search}%` } },
      ];
    }
    if (role   !== "all")        where.role        = role;
    if (status === "suspended")  where.isSuspended = true;
    if (status === "active")     where.isSuspended = false;
    if (status === "unverified") where.isVerified  = false;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password", "otp", "otpExpiry"] },
      include: [
        { model: TenantProfile,   as: "tenantProfile",   required: false },
        { model: LandlordProfile, as: "landlordProfile", required: false },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset,
      distinct: true,
    });

    const data = rows.map(u => {
      const json = u.toJSON();
      json.trustScore = u.role === "tenant" && u.tenantProfile?.trustScore != null
        ? Math.min(u.tenantProfile.trustScore, 100) : null;
      return json;
    });

    return res.json({
      success: true, data,
      pagination: { total: count, page: Number(page), limit: Number(limit), totalPages: Math.ceil(count / Number(limit)) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const { User, TenantProfile, LandlordProfile, TrustScoreLog } = getDb();
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password", "otp", "otpExpiry"] },
      include: [
        { model: TenantProfile,   as: "tenantProfile",   required: false },
        { model: LandlordProfile, as: "landlordProfile", required: false },
      ],
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const json = user.toJSON();
    if (user.role === "tenant") {
      const logs = await TrustScoreLog.findAll({ where: { tenantId: user.id }, order: [["createdAt","DESC"]], limit: 20 });
      json.trustScore   = user.tenantProfile?.trustScore ?? 100;
      json.trustHistory = logs;
    }
    return res.json({ success: true, data: json });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/users/:id/suspend", protect, adminOnly, async (req, res) => {
  try {
    const { User } = getDb();
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const nowSuspended = !user.isSuspended;
    await user.update({ isSuspended: nowSuspended });

    log({
      ...fromReq(req),
      action:   nowSuspended ? `Suspended user: ${user.email}` : `Reactivated user: ${user.email}`,
      severity: nowSuspended ? "WARNING" : "INFO",
      target:   `User: ${user.firstName} ${user.lastName} (${user.email})`,
    });

    return res.json({ success: true, message: nowSuspended ? "User suspended" : "User reactivated", data: { id: user.id, isSuspended: nowSuspended } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/users/:id/verify-kyc", protect, adminOnly, async (req, res) => {
  try {
    const { User, TrustScoreLog } = getDb();
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await user.update({ isVerified: true });

    if (user.role === "tenant") {
      const already = await TrustScoreLog.findOne({ where: { tenantId: user.id, reason: "id_verified" } });
      if (!already) {
        await require("../services/trustScoreService").addEvent({ tenantId: user.id, reason: "id_verified", note: "KYC approved by admin" }).catch(() => {});
      }
    }

    try {
      await require("../services/notificationService").send({ userId: user.id, type: "kyc_approved", title: "Identity Verified ✓", message: "Your identity has been verified. You now have full access to InzuTrust." });
    } catch (_) {}

    log({
      ...fromReq(req),
      action:   `KYC approved for: ${user.email}`,
      severity: "SUCCESS",
      target:   `User: ${user.firstName} ${user.lastName}`,
    });

    return res.json({ success: true, message: "KYC verified", data: { id: user.id, isVerified: true } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const { User } = getDb();
    const user = await User.findByPk(req.params.id);
    if (!user)               return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ success: false, message: "Cannot delete admin users" });

    log({
      ...fromReq(req),
      action:   `Deleted user account: ${user.email}`,
      severity: "CRITICAL",
      target:   `User: ${user.firstName} ${user.lastName} (${user.role})`,
    });

    await user.destroy();
    return res.json({ success: true, message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════
//  PROPERTIES — verification queue
// ═══════════════════════════════════════════════════════
router.get("/properties", protect, adminOnly, async (req, res) => {
  try {
    const { Property, User } = getDb();
    const { status = "all", search = "", page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where  = {};

    if (status !== "all") where.verificationStatus = status;
    if (search) {
      where[Op.or] = [
        { title:    { [Op.like]: `%${search}%` } },
        { address:  { [Op.like]: `%${search}%` } },
        { district: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Property.findAndCountAll({
      where,
      include: [{ model: User, as: "landlord", attributes: ["id","firstName","lastName","email","phone"] }],
      order:    [["createdAt", "DESC"]],
      limit:    Number(limit),
      offset,
      distinct: true,
    });

    return res.json({
      success: true, data: rows,
      pagination: { total: count, page: Number(page), totalPages: Math.ceil(count / Number(limit)) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/properties/:id/verify", protect, adminOnly, async (req, res) => {
  try {
    const { Property } = getDb();
    const prop = await Property.findByPk(req.params.id);
    if (!prop) return res.status(404).json({ success: false, message: "Property not found" });

    await prop.update({ verificationStatus: "verified", verifiedAt: new Date(), verifiedBy: req.user.id });

    log({
      ...fromReq(req),
      action:   `Property listing approved: "${prop.title}"`,
      severity: "SUCCESS",
      target:   `Property: ${prop.title} (${prop.district})`,
    });

    return res.json({ success: true, message: "Property verified", data: prop });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/properties/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const { Property } = getDb();
    const { reason } = req.body;
    const prop = await Property.findByPk(req.params.id);
    if (!prop) return res.status(404).json({ success: false, message: "Property not found" });

    await prop.update({ verificationStatus: "rejected", rejectionReason: reason || null });

    log({
      ...fromReq(req),
      action:   `Property listing rejected: "${prop.title}"`,
      severity: "WARNING",
      target:   `Property: ${prop.title}`,
      metadata: { reason },
    });

    return res.json({ success: true, message: "Property rejected", data: prop });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════
//  DISPUTES
// ═══════════════════════════════════════════════════════
router.get("/disputes", protect, adminOnly, async (req, res) => {
  try {
    const { Dispute, User, Property } = getDb();
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Dispute.findAndCountAll({
      where,
      limit:  Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      include: [
        { model: User,     as: "reporter",    attributes: ["firstName","lastName","role"] },
        { model: User,     as: "respondent",  attributes: ["firstName","lastName","role"] },
        { model: Property, as: "property",    attributes: ["title"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.json({ success: true, total: count, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════
//  AUDIT LOGS
// ═══════════════════════════════════════════════════════
router.post("/logs/seed", protect, adminOnly, async (req, res) => {
  try {
    const { AuditLog } = getDb();
    const adminName = req.user ? `${req.user.firstName} ${req.user.lastName}` : "Admin";
    const adminId   = req.user?.id || null;
    const ip        = req.ip || "127.0.0.1";
 
    const now = Date.now();
    const seeds = [
      { actorId: adminId, actorName: adminName,       actorRole: "admin",    action: "User logged in",                             target: req.user?.email,            severity: "INFO",     sourceIp: ip },
      { actorId: adminId, actorName: adminName,       actorRole: "admin",    action: "KYC approved for: tenant@inzutrust.rw",      target: "User: Jean Bosco",         severity: "SUCCESS",  sourceIp: ip },
      { actorId: adminId, actorName: adminName,       actorRole: "admin",    action: "Property listing approved: \"Kigali Heights\"", target: "Property: Kigali Heights (Gasabo)", severity: "SUCCESS", sourceIp: ip },
      { actorId: adminId, actorName: adminName,       actorRole: "admin",    action: "Suspended user: badactor@gmail.com",         target: "User: Bad Actor (tenant)", severity: "WARNING",  sourceIp: ip },
      { actorId: null,    actorName: "System",        actorRole: "system",   action: "Failed login attempt",                       target: "unknown@email.com",        severity: "WARNING",  sourceIp: "41.186.50.10" },
      { actorId: null,    actorName: "Iradukunda J.", actorRole: "tenant",   action: "User logged in",                             target: "iradukunda@gmail.com",     severity: "INFO",     sourceIp: "41.186.50.22" },
      { actorId: null,    actorName: "Yvette K.",     actorRole: "landlord", action: "User logged in",                             target: "yvette@inzutrust.rw",      severity: "INFO",     sourceIp: "41.186.50.55" },
      { actorId: adminId, actorName: adminName,       actorRole: "admin",    action: "Property listing rejected: \"Fake Villa\"",  target: "Property: Fake Villa",     severity: "WARNING",  sourceIp: ip, metadata: { reason: "Unverifiable ownership documents" } },
      { actorId: adminId, actorName: adminName,       actorRole: "admin",    action: "Deleted user account: spam@test.com",        target: "User: Spam Account (tenant)", severity: "CRITICAL", sourceIp: ip },
      { actorId: null,    actorName: "System",        actorRole: "system",   action: "Failed login attempt",                       target: "admin@inzutrust.rw",       severity: "ERROR",    sourceIp: "197.243.10.5" },
      { actorId: null,    actorName: "Keza M.",       actorRole: "tenant",   action: "User logged in",                             target: "keza@gmail.com",           severity: "INFO",     sourceIp: "41.186.50.77" },
      { actorId: adminId, actorName: adminName,       actorRole: "admin",    action: "Reactivated user: restored@gmail.com",       target: "User: Restored Account",   severity: "INFO",     sourceIp: ip },
      { actorId: null,    actorName: "Bosco M.",      actorRole: "tenant",   action: "New user registered",                        target: "bosco@gmail.com",          severity: "INFO",     sourceIp: "41.186.50.99" },
      { actorId: null,    actorName: "Aline N.",      actorRole: "landlord", action: "New user registered",                        target: "aline@gmail.com",          severity: "INFO",     sourceIp: "41.186.51.10" },
      { actorId: adminId, actorName: adminName,       actorRole: "admin",    action: "KYC approved for: landlord@inzutrust.rw",    target: "User: Yvette Kamana",      severity: "SUCCESS",  sourceIp: ip },
    ];
 
    // Spread entries across last 23 hours so they all fall within the default "Last 24h" filter
    const created = await Promise.all(
      seeds.map((s, i) =>
        AuditLog.create({
          ...s,
          createdAt: new Date(now - i * 55 * 60 * 1000), // every ~55 minutes back
        })
      )
    );
 
    return res.json({ success: true, message: `${created.length} audit log entries seeded successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
// GET /api/admin/logs
router.get("/logs", protect, adminOnly, async (req, res) => {
  try {
    const { AuditLog } = getDb();
    const { page = 1, limit = 50, severity, search, dateRange } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = {};

    // 1. Filter by Severity
    if (severity && severity !== "all") {
      where.severity = severity.toUpperCase();
    }

    // 2. Filter by Search (Action or Target)
    if (search) {
      where[Op.or] = [
        { action: { [Op.like]: `%${search}%` } },
        { target: { [Op.like]: `%${search}%` } },
        { actorName: { [Op.like]: `%${search}%` } }
      ];
    }

    // 3. Filter by Date Range
    if (dateRange) {
      const now = new Date();
      if (dateRange === "1h") where.createdAt = { [Op.gte]: new Date(now - 60 * 60 * 1000) };
      else if (dateRange === "24h") where.createdAt = { [Op.gte]: new Date(now - 24 * 60 * 60 * 1000) };
      else if (dateRange === "7d") where.createdAt = { [Op.gte]: new Date(now - 7 * 24 * 60 * 60 * 1000) };
      else if (dateRange === "30d") where.createdAt = { [Op.gte]: new Date(now - 30 * 24 * 60 * 60 * 1000) };
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      limit: Number(limit),
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    // Generate severity summary for the bottom chips
    const summary = await AuditLog.findAll({
      attributes: ['severity', [fn('COUNT', col('id')), 'count']],
      group: ['severity'],
      raw: true
    }).catch(() => []);

    const formattedSummary = summary.reduce((acc, curr) => {
      acc[curr.severity] = parseInt(curr.count);
      return acc;
    }, {});

    return res.json({
      success: true,
      data: rows,
      summary: formattedSummary,
      pagination: {
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / Number(limit))
      }
    });
  } catch (err) {
    console.error("Logs Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});
 

module.exports = router;