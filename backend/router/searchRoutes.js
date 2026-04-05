// router/searchRoutes.js
// GET /api/search?q=...&role=tenant|landlord|admin|agent
// Returns grouped results: properties, tenants, agreements, disputes, maintenance

const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { Op } = require("sequelize");

const getDb = () => require("../model");

router.get("/", protect, async (req, res) => {
  try {
    const { q = "", limit = 5 } = req.query;
    if (!q.trim() || q.trim().length < 2) {
      return res.json({ success: true, data: {} });
    }

    const db     = getDb();
    const userId = req.user.id;
    const role   = req.user.role;
    const lim    = Math.min(Number(limit), 20);
    const like   = { [Op.like]: `%${q.trim()}%` };

    const results = {};

    // ── Properties ────────────────────────────────────────────────────────────
    const propWhere = {
      [Op.or]: [
        { title:    like },
        { district: like },
        { address:  like },
        { sector:   like },
      ],
    };
    if (role === "landlord") propWhere.landlordId = userId;
    if (role === "agent") {
      // Agent: only their assigned properties
      const assignments = await db.AgentProperty.findAll({ where: { agentId: userId, isActive: true }, attributes: ["propertyId"] });
      propWhere.id = { [Op.in]: assignments.map(a => a.propertyId) };
    }

    results.properties = await db.Property.findAll({
      where: propWhere,
      attributes: ["id","title","district","address","type","rentAmount","mainImage","verificationStatus","status"],
      include: [{ model: db.User, as: "landlord", attributes: ["firstName","lastName"], required: false }],
      limit: lim,
    });

    // ── Tenants (landlord/agent/admin only) ───────────────────────────────────
    if (["landlord","agent","admin"].includes(role)) {
      const tenantWhere = {
        role: "tenant",
        [Op.or]: [{ firstName: like }, { lastName: like }, { email: like }, { phone: like }],
      };

      if (role === "landlord" || role === "agent") {
        // Find tenants through signed agreements
        const agrWhere = role === "landlord" ? { landlordId: userId, status: "signed" } : {};
        const agrs = await db.Agreement.findAll({
          where:      agrWhere,
          attributes: ["tenantId"],
          group:      ["tenantId"],
        });
        const tenantIds = agrs.map(a => a.tenantId);
        if (tenantIds.length > 0) tenantWhere.id = { [Op.in]: tenantIds };
        else {
          results.tenants = [];
          goto_agreements: ;
        }
      }

      if (!results.tenants) {
        results.tenants = await db.User.findAll({
          where:      tenantWhere,
          attributes: ["id","firstName","lastName","email","phone","lastSeenAt","isVerified"],
          include: [{ model: db.TenantProfile, as: "tenantProfile", attributes: ["trustScore"], required: false }],
          limit:   lim,
        });
      }
    }

    // ── Agreements ────────────────────────────────────────────────────────────
    const agrWhere = {
      [Op.or]: [
        { "$property.title$": like },
        { "$tenant.firstName$": like },
        { "$tenant.lastName$": like },
      ],
    };
    if (role === "landlord") agrWhere.landlordId = userId;
    if (role === "tenant")   agrWhere.tenantId   = userId;

    results.agreements = await db.Agreement.findAll({
      where: role === "landlord" ? { landlordId: userId } : role === "tenant" ? { tenantId: userId } : {},
      include: [
        { model: db.Property, as: "property", attributes: ["id","title","district"], where: role === "admin" ? {} : { title: like }, required: false },
        { model: db.User,     as: "tenant",   attributes: ["id","firstName","lastName","email"], required: false },
        { model: db.User,     as: "landlord", attributes: ["id","firstName","lastName"],         required: false },
      ],
      attributes: ["id","status","startDate","endDate","rentAmount","createdAt"],
      limit: lim,
    }).then(rows => rows.filter(r =>
      r.property?.title?.toLowerCase().includes(q.toLowerCase()) ||
      r.tenant?.firstName?.toLowerCase().includes(q.toLowerCase()) ||
      r.tenant?.lastName?.toLowerCase().includes(q.toLowerCase())  ||
      r.tenant?.email?.toLowerCase().includes(q.toLowerCase())
    ));

    // ── Disputes ──────────────────────────────────────────────────────────────
    const disWhere = {
      [Op.or]: [{ title: like }, { description: like }],
    };
    if (role === "tenant")   disWhere.reporterId  = userId;
    if (role === "landlord") disWhere.respondentId = userId;

    results.disputes = await db.Dispute.findAll({
      where:      disWhere,
      attributes: ["id","docId","title","status","category","stage","createdAt"],
      include: [
        { model: db.User, as: "reporter",   attributes: ["firstName","lastName"], required: false },
        { model: db.User, as: "respondent", attributes: ["firstName","lastName"], required: false },
      ],
      limit: lim,
    });

    // ── Maintenance ───────────────────────────────────────────────────────────
    const maintWhere = {
      [Op.or]: [{ title: like }, { description: like }],
    };
    if (role === "tenant")   maintWhere.tenantId   = userId;
    if (role === "landlord") maintWhere.landlordId  = userId;
    if (role === "agent")    maintWhere.assignedAgentId = userId;

    results.maintenance = await db.MaintenanceRequest.findAll({
      where:      maintWhere,
      attributes: ["id","title","status","priority","category","createdAt"],
      include: [
        { model: db.Property, as: "property", attributes: ["id","title"], required: false },
        { model: db.User,     as: "tenant",   attributes: ["firstName","lastName"], required: false },
      ],
      limit: lim,
    });

    // ── Users (admin only) ────────────────────────────────────────────────────
    if (role === "admin") {
      results.users = await db.User.findAll({
        where: {
          [Op.or]: [{ firstName: like }, { lastName: like }, { email: like }],
        },
        attributes: ["id","firstName","lastName","email","role","isVerified","isSuspended","lastSeenAt"],
        limit: lim,
      });
    }

    // Strip empty arrays
    Object.keys(results).forEach(k => {
      if (Array.isArray(results[k]) && results[k].length === 0) delete results[k];
    });

    const total = Object.values(results).reduce((s, a) => s + (Array.isArray(a) ? a.length : 0), 0);

    return res.json({ success: true, query: q, total, data: results });
  } catch (err) {
    console.error("[Search]", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;