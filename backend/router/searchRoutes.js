// router/searchRoutes.js
// GET /api/search?q=...&limit=5
// Returns grouped results scoped to the user's role
// Register in app.js: app.use("/api/search", require("./router/searchRoutes"));

const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { Op } = require("sequelize");

const getDb = () => require("../model");

router.get("/", protect, async (req, res) => {
  try {
    const { q = "", limit = 5 } = req.query;
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 2) {
      return res.json({ success: true, query: q, total: 0, data: {} });
    }

    const db     = getDb();
    const userId = req.user.id;
    const role   = req.user.role;
    const lim    = Math.min(Number(limit) || 5, 20);
    const like   = { [Op.like]: `%${trimmed}%` };
    const results = {};

    // ── Properties ─────────────────────────────────────────────────────────
    const propWhere = {
      [Op.or]: [{ title: like }, { district: like }, { address: like }, { sector: like }],
    };
    if (role === "landlord") propWhere.landlordId = userId;
    if (role === "agent") {
      const assignments = await db.AgentProperty.findAll({
        where: { agentId: userId, isActive: true },
        attributes: ["propertyId"],
      });
      const ids = assignments.map(a => a.propertyId);
      if (ids.length === 0) {
        results.properties = [];
      } else {
        propWhere.id = { [Op.in]: ids };
      }
    }

    if (!Array.isArray(results.properties)) {
      results.properties = await db.Property.findAll({
        where: propWhere,
        attributes: ["id","title","district","address","type","rentAmount","mainImage","verificationStatus","status"],
        include: [{ model: db.User, as: "landlord", attributes: ["firstName","lastName"], required: false }],
        limit: lim,
      });
    }

    // ── Tenants (landlord / agent / admin only) ─────────────────────────────
    if (["landlord", "agent", "admin"].includes(role)) {
      const tenantNameWhere = {
        role: "tenant",
        [Op.or]: [{ firstName: like }, { lastName: like }, { email: like }, { phone: like }],
      };

      if (role === "landlord" || role === "agent") {
        // Scope to tenants who have signed agreements on this user's properties
        const agrScope = role === "landlord" ? { landlordId: userId, status: "signed" } : { status: "signed" };
        const agrs = await db.Agreement.findAll({
          where: agrScope, attributes: ["tenantId"],
        });
        const tenantIds = [...new Set(agrs.map(a => a.tenantId))];

        if (tenantIds.length === 0) {
          results.tenants = [];
        } else {
          tenantNameWhere.id = { [Op.in]: tenantIds };
          results.tenants = await db.User.findAll({
            where: tenantNameWhere,
            attributes: ["id","firstName","lastName","email","phone","lastSeenAt","isVerified"],
            include: [{ model: db.TenantProfile, as: "tenantProfile", attributes: ["trustScore"], required: false }],
            limit: lim,
          });
        }
      } else {
        // Admin: search all tenants
        results.tenants = await db.User.findAll({
          where: tenantNameWhere,
          attributes: ["id","firstName","lastName","email","phone","lastSeenAt","isVerified"],
          include: [{ model: db.TenantProfile, as: "tenantProfile", attributes: ["trustScore"], required: false }],
          limit: lim,
        });
      }
    }

    // ── Agreements ──────────────────────────────────────────────────────────
    const agrScope = {};
    if (role === "landlord") agrScope.landlordId = userId;
    if (role === "tenant")   agrScope.tenantId   = userId;

    const allAgrs = await db.Agreement.findAll({
      where: agrScope,
      include: [
        { model: db.Property, as: "property", attributes: ["id","title","district"], required: false },
        { model: db.User,     as: "tenant",   attributes: ["id","firstName","lastName","email"], required: false },
        { model: db.User,     as: "landlord", attributes: ["id","firstName","lastName"],         required: false },
      ],
      attributes: ["id","status","startDate","endDate","rentAmount","createdAt"],
      limit: lim * 3, // fetch more then filter in JS
    });

    results.agreements = allAgrs.filter(r => {
      const s = trimmed.toLowerCase();
      return (
        r.property?.title?.toLowerCase().includes(s) ||
        r.tenant?.firstName?.toLowerCase().includes(s) ||
        r.tenant?.lastName?.toLowerCase().includes(s)  ||
        r.tenant?.email?.toLowerCase().includes(s)
      );
    }).slice(0, lim);

    // ── Disputes ────────────────────────────────────────────────────────────
    const disWhere = {
      [Op.or]: [{ title: like }, { description: like }],
    };
    if (role === "tenant")   disWhere.reporterId  = userId;
    if (role === "landlord") disWhere.respondentId = userId;

    results.disputes = await db.Dispute.findAll({
      where: disWhere,
      attributes: ["id","docId","title","status","category","stage","createdAt"],
      include: [
        { model: db.User, as: "reporter",   attributes: ["firstName","lastName"], required: false },
        { model: db.User, as: "respondent", attributes: ["firstName","lastName"], required: false },
      ],
      limit: lim,
    });

    // ── Maintenance ─────────────────────────────────────────────────────────
    const maintWhere = {
      [Op.or]: [{ title: like }, { description: like }],
    };
    if (role === "tenant")   maintWhere.tenantId        = userId;
    if (role === "landlord") maintWhere.landlordId       = userId;
    if (role === "agent")    maintWhere.assignedAgentId  = userId;

    results.maintenance = await db.MaintenanceRequest.findAll({
      where: maintWhere,
      attributes: ["id","title","status","priority","category","createdAt"],
      include: [
        { model: db.Property, as: "property", attributes: ["id","title"], required: false },
        { model: db.User,     as: "tenant",   attributes: ["firstName","lastName"], required: false },
      ],
      limit: lim,
    });

    // ── Users (admin only) ───────────────────────────────────────────────────
    if (role === "admin") {
      results.users = await db.User.findAll({
        where: {
          [Op.or]: [{ firstName: like }, { lastName: like }, { email: like }],
        },
        attributes: ["id","firstName","lastName","email","role","isVerified","isSuspended","lastSeenAt"],
        limit: lim,
      });
    }

    // Remove empty arrays to keep response clean
    Object.keys(results).forEach(k => {
      if (Array.isArray(results[k]) && results[k].length === 0) delete results[k];
    });

    const total = Object.values(results).reduce((s, a) => s + (Array.isArray(a) ? a.length : 0), 0);

    return res.json({ success: true, query: trimmed, total, data: results });
  } catch (err) {
    console.error("[Search]", err.message, err.stack);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;