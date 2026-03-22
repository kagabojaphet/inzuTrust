// routes/adminRoutes.js
const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { Op, fn, col, literal } = require("sequelize");

// Helper to safely load models and avoid circular dependencies
const getDb = () => require("../model");

// FIX: Changed '../service/...' to '../services/...'
const trustScoreService = require("../services/trustScoreService");

// ── GET /api/admin/dashboard/stats ───────────────────────────────────────────
router.get("/dashboard/stats", protect, adminOnly, async (req, res) => {
  try {
    const db = getDb();
    const [
      totalUsers, landlords, tenants,
      totalProperties, activeAgreements,
      totalPaymentsRow, escrowRow,
      openDisputes, resolvedDisputes,
    ] = await Promise.all([
      db.User.count(),
      db.User.count({ where: { role: "landlord" } }),
      db.User.count({ where: { role: "tenant"   } }),
      db.Property.count(),
      db.Agreement.count({ where: { status: "signed" } }),
      db.Payment.sum("amount", { where: { status: "paid" } }),
      db.Payment.sum("amount", { where: { inEscrow: true } }),
      db.Dispute.count({ where: { status: { [Op.in]: ["open","under_review","mediation"] } } }),
      db.Dispute.count({ where: { status: "resolved" } }),
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueRows = await db.Payment.findAll({
      where: { status: "paid", paidAt: { [Op.gte]: sixMonthsAgo } },
      attributes: [
        [fn("DATE_FORMAT", col("paidAt"), "%Y-%m"), "month"],
        [fn("SUM", col("amount")), "revenue"],
      ],
      group: [literal("DATE_FORMAT(`paidAt`, '%Y-%m')")],
      order:  [[literal("DATE_FORMAT(`paidAt`, '%Y-%m')"), "ASC"]],
      raw: true,
    });

    // User acquisition by month
    const acquisitionRows = await db.User.findAll({
      where: { createdAt: { [Op.gte]: sixMonthsAgo } },
      attributes: [
        [fn("DATE_FORMAT", col("createdAt"), "%b"), "month"],
        "role",
        [fn("COUNT", col("id")), "count"],
      ],
      group: [literal("DATE_FORMAT(`createdAt`, '%b')"), "role"],
      raw: true,
    });

    return res.json({
      success: true,
      data: {
        stats: {
          totalUsers, landlords, tenants,
          totalProperties, activeAgreements,
          totalVolume:    totalPaymentsRow || 0,
          escrowBalance:  escrowRow         || 0,
          openDisputes,   resolvedDisputes,
        },
        revenueChart:   revenueRows,
        acquisitionChart: acquisitionRows,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/admin/users ─────────────────────────────────────────────────────
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const db = getDb();
    const { role, page = 1, limit = 20, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) where[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName:  { [Op.like]: `%${search}%` } },
      { email:     { [Op.like]: `%${search}%` } },
    ];

    const { count, rows } = await db.User.findAndCountAll({
      where, limit: Number(limit), offset: (page-1)*limit,
      attributes: ["id","firstName","lastName","email","role","isVerified","createdAt"],
      include: [
        { model: db.TenantProfile,   as:"tenantProfile",   attributes:["trustScore","idVerified"], required:false },
        { model: db.LandlordProfile, as:"landlordProfile", attributes:["isVerified"],               required:false },
      ],
      order: [["createdAt","DESC"]],
    });

    return res.json({ success:true, total:count, page:Number(page), data:rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/admin/users/:id/suspend ─────────────────────────────────────────
router.put("/users/:id/suspend", protect, adminOnly, async (req, res) => {
  try {
    const user = await getDb().User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success:false, message:"User not found" });
    await user.update({ isVerified: !user.isVerified });
    return res.json({ success:true, message:user.isVerified?"User activated":"User suspended" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/admin/kyc/queue ─────────────────────────────────────────────────
router.get("/kyc/queue", protect, adminOnly, async (req, res) => {
  try {
    const db = getDb();
    const pending = await db.User.findAll({
      where: { isVerified: false },
      attributes: ["id","firstName","lastName","email","role","createdAt"],
      include: [
        { model: db.TenantProfile,   as:"tenantProfile",   attributes:["idVerified","idType"], required:false },
        { model: db.LandlordProfile, as:"landlordProfile", attributes:["isVerified","tinNumber"], required:false },
      ],
      order: [["createdAt","DESC"]],
      limit: 50,
    });
    return res.json({ success:true, data:pending });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/admin/kyc/:id/approve ───────────────────────────────────────────
router.put("/kyc/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const user = await getDb().User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success:false, message:"User not found" });
    await user.update({ isVerified: true });

    if (user.role === "tenant") {
      await trustScoreService.addEvent({
        tenantId: user.id, reason:"id_verified",
        note:"KYC approved by admin",
      });
    }

    // FIX: Changed path to plural 'services'
    const notificationService = require("../services/notificationService");
    
    await notificationService.send({
        userId: user.id,
        type: "kyc_approved",
        title: "Account Verified",
        message: "Your identity documents have been approved. Welcome to InzuTrust!"
    });

    return res.json({ success:true, message:"KYC approved" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/admin/properties ────────────────────────────────────────────────
router.get("/properties", protect, adminOnly, async (req, res) => {
  try {
    const db = getDb();
    const { status, page=1, limit=20 } = req.query;
    const where = {};
    if (status) where.status = status;
    const { count, rows } = await db.Property.findAndCountAll({
      where, limit:Number(limit), offset:(page-1)*limit,
      include:[{ model: db.User, as:"landlord", attributes:["firstName","lastName","email"] }],
      order:[["createdAt","DESC"]],
    });
    return res.json({ success:true, total:count, data:rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ... (rest of the file remains similar, but ensure getDb() is used for all model access)

module.exports = router;