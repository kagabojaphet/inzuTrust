// controllers/agentController.js
const bcrypt = require("bcryptjs");
const { Op }  = require("sequelize");

const getDb    = () => require("../model");
const audit    = () => require("../services/auditLogService");
const notify   = () => require("../services/notificationService");

const safe = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (err) {
    console.error(`[agentController] ${err.message}`);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/agents/create ──────────────────────────────────────────────────
// Landlord creates agent + sends welcome email with credentials
const createAgent = safe(async (req, res) => {
  const { User, sequelize } = getDb();
  const { firstName, lastName, email, password, phone } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: "firstName, lastName, email, and password are required." });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(400).json({ success: false, message: "Email already registered." });
  }

  const t = await sequelize.transaction();
  try {
    const hashed = await bcrypt.hash(password, 10);

    // Generate OTP for email verification
    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hr

    const agent = await User.create({
      firstName, lastName, email,
      phone:           phone || null,
      password:        hashed,
      role:            "agent",
      isEmailVerified: false,  // must verify via OTP email
      isVerified:      false,
      otp,
      otpExpiry,
    }, { transaction: t });

    await t.commit();

    // Send welcome email with credentials + OTP
    try {
      const { sendOtpEmail } = require("../config/emailConfig");
      await sendOtpEmail(email, otp, `${firstName} ${lastName}`, {
        subject: `Welcome to InzuTrust — Your Agent Account`,
        isAgentWelcome: true,
        landlordName: `${req.user.firstName} ${req.user.lastName}`,
        tempPassword: password,
      });
    } catch (mailErr) {
      console.warn("[agentController] Welcome email failed:", mailErr.message);
      // Non-fatal — agent is created, email just didn't send
    }

    audit().log.info({
      actorId:   req.user.id,
      actorName: `${req.user.firstName} ${req.user.lastName}`,
      actorRole: req.user.role,
      action:    `Created agent account: ${email}`,
      target:    email,
      severity:  "INFO",
      sourceIp:  req.ip,
    });

    return res.status(201).json({
      success: true,
      message: "Agent account created. A welcome email with login credentials has been sent.",
      data: {
        id: agent.id, firstName: agent.firstName, lastName: agent.lastName,
        email: agent.email, role: agent.role, createdAt: agent.createdAt,
      },
    });
  } catch (err) {
    await t.rollback();
    throw err;
  }
});

// ─── POST /api/agents/assign ──────────────────────────────────────────────────
const assignProperties = safe(async (req, res) => {
  const { User, Property, AgentProperty } = getDb();
  const { agentId, propertyIds, permissions = {} } = req.body;

  if (!agentId || !Array.isArray(propertyIds) || propertyIds.length === 0) {
    return res.status(400).json({ success: false, message: "agentId and a non-empty propertyIds array are required." });
  }

  const agent = await User.findOne({ where: { id: agentId, role: "agent" } });
  if (!agent) return res.status(404).json({ success: false, message: "Agent not found." });

  const results = [], skipped = [];

  await Promise.all(propertyIds.map(async (propId) => {
    const where = req.user.role === "admin" ? { id: propId } : { id: propId, landlordId: req.user.id };
    const property = await Property.findOne({ where });
    if (!property) { skipped.push(propId); return; }

    const [assignment, created] = await AgentProperty.findOrCreate({
      where:    { agentId, propertyId: propId },
      defaults: {
        assignedById:         req.user.id,
        canEditDetails:       permissions.canEditDetails       ?? true,
        canManageTenants:     permissions.canManageTenants     ?? true,
        canViewPayments:      permissions.canViewPayments      ?? false,
        canHandleMaintenance: permissions.canHandleMaintenance ?? true,
        canCreateProperty:    permissions.canCreateProperty    ?? false,
        canViewTenants:       permissions.canViewTenants       ?? true,
        canRespondDisputes:   permissions.canRespondDisputes   ?? false,
        isActive:             true,
      },
    });

    if (!created && !assignment.isActive) {
      await assignment.update({ isActive: true, ...permissions });
    }

    results.push({ propertyId: propId, title: property.title, created });
  }));

  // Notify the agent about the assignment
  notify().send({
    userId:        agentId,
    type:          "agent_assigned",
    title:         "🏠 Properties Assigned",
    message:       `${req.user.firstName} assigned you to ${results.length} propert${results.length === 1 ? "y" : "ies"}.`,
    referenceType: "AgentProperty",
  }).catch(() => {});

  audit().log.info({
    actorId: req.user.id, actorName: `${req.user.firstName} ${req.user.lastName}`,
    actorRole: req.user.role,
    action: `Assigned agent ${agent.email} to ${results.length} properties`,
    target: agent.email, severity: "INFO", sourceIp: req.ip,
  });

  return res.status(200).json({
    success: true,
    message: `Agent assigned to ${results.length} propert${results.length === 1 ? "y" : "ies"}.${skipped.length ? ` ${skipped.length} skipped.` : ""}`,
    data: { assigned: results, skipped },
  });
});

// ─── DELETE /api/agents/revoke ────────────────────────────────────────────────
const revokeProperty = safe(async (req, res) => {
  const { Property, AgentProperty } = getDb();
  const { agentId, propertyId } = req.body;

  if (!agentId || !propertyId) {
    return res.status(400).json({ success: false, message: "agentId and propertyId are required." });
  }

  const where = req.user.role === "admin" ? { id: propertyId } : { id: propertyId, landlordId: req.user.id };
  const property = await Property.findOne({ where });
  if (!property) return res.status(403).json({ success: false, message: "Property not found or not owned by you." });

  const assignment = await AgentProperty.findOne({ where: { agentId, propertyId } });
  if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found." });

  await assignment.update({ isActive: false });

  audit().log.warning({
    actorId: req.user.id, actorName: `${req.user.firstName} ${req.user.lastName}`,
    actorRole: req.user.role, action: `Revoked agent from property: "${property.title}"`,
    target: `Agent ID: ${agentId}`, severity: "WARNING", sourceIp: req.ip,
  });

  return res.json({ success: true, message: "Agent revoked from property." });
});

// ─── PUT /api/agents/permissions ─────────────────────────────────────────────
const updatePermissions = safe(async (req, res) => {
  const { Property, AgentProperty } = getDb();
  const { agentId, propertyId, permissions } = req.body;

  if (!agentId || !propertyId || !permissions) {
    return res.status(400).json({ success: false, message: "agentId, propertyId, and permissions are required." });
  }

  const where = req.user.role === "admin" ? { id: propertyId } : { id: propertyId, landlordId: req.user.id };
  const property = await Property.findOne({ where });
  if (!property) return res.status(403).json({ success: false, message: "Property not found." });

  const assignment = await AgentProperty.findOne({ where: { agentId, propertyId } });
  if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found." });

  const allowed = [
    "canEditDetails", "canManageTenants", "canViewPayments",
    "canHandleMaintenance", "canCreateProperty", "canViewTenants",
    "canRespondDisputes", "isActive", "expiresAt",
  ];
  const updates = {};
  allowed.forEach(k => { if (k in permissions) updates[k] = permissions[k]; });
  await assignment.update(updates);

  return res.json({ success: true, message: "Permissions updated.", data: assignment });
});

// ─── GET /api/agents ──────────────────────────────────────────────────────────
const getMyAgents = safe(async (req, res) => {
  const { User, Property, AgentProperty } = getDb();

  const assignments = await AgentProperty.findAll({
    include: [
      {
        model: User, as: "agent",
        attributes: ["id","firstName","lastName","email","phone","isVerified","isEmailVerified","isSuspended","lastSeenAt","createdAt"],
      },
      {
        model: Property, as: "property",
        attributes: ["id","title","district","address","type","rentAmount","status","mainImage","verificationStatus"],
        where: req.user.role === "admin" ? {} : { landlordId: req.user.id },
      },
    ],
    where: { isActive: true },
    order: [["createdAt", "DESC"]],
  });

  const agentMap = new Map();
  assignments.forEach(a => {
    const aid = a.agent.id;
    if (!agentMap.has(aid)) agentMap.set(aid, { agent: a.agent.toJSON(), properties: [] });
    agentMap.get(aid).properties.push({
      ...a.property.toJSON(),
      permissions: {
        canEditDetails: a.canEditDetails, canManageTenants: a.canManageTenants,
        canViewPayments: a.canViewPayments, canHandleMaintenance: a.canHandleMaintenance,
        canCreateProperty: a.canCreateProperty, canViewTenants: a.canViewTenants,
        canRespondDisputes: a.canRespondDisputes,
      },
      assignedAt: a.createdAt,
    });
  });

  return res.json({ success: true, data: [...agentMap.values()] });
});

// ─── GET /api/agents/:agentId ─────────────────────────────────────────────────
const getAgentDetail = safe(async (req, res) => {
  const { User, Property, AgentProperty } = getDb();

  const agent = await User.findOne({
    where: { id: req.params.agentId, role: "agent" },
    attributes: { exclude: ["password", "otp", "otpExpiry"] },
  });
  if (!agent) return res.status(404).json({ success: false, message: "Agent not found." });

  const assignments = await AgentProperty.findAll({
    where: { agentId: agent.id, isActive: true },
    include: [{
      model: Property, as: "property",
      attributes: ["id","title","district","type","rentAmount","status","mainImage","verificationStatus"],
      where: req.user.role === "admin" ? {} : { landlordId: req.user.id },
    }],
    order: [["createdAt", "DESC"]],
  });

  return res.json({
    success: true,
    data: {
      agent: agent.toJSON(),
      assignments: assignments.map(a => ({
        propertyId: a.propertyId,
        property:   a.property,
        permissions: {
          canEditDetails: a.canEditDetails, canManageTenants: a.canManageTenants,
          canViewPayments: a.canViewPayments, canHandleMaintenance: a.canHandleMaintenance,
          canCreateProperty: a.canCreateProperty, canViewTenants: a.canViewTenants,
          canRespondDisputes: a.canRespondDisputes,
        },
        assignedAt: a.createdAt,
      })),
    },
  });
});

// ─── GET /api/agents/my-properties ───────────────────────────────────────────
const getAgentProperties = safe(async (req, res) => {
  const { Property, AgentProperty, User, Agreement, LeaseApplication } = getDb();

  const assignments = await AgentProperty.findAll({
    where: { agentId: req.user.id, isActive: true },
    include: [{
      model: Property, as: "property",
      include: [
        { model: User, as: "landlord", attributes: ["id","firstName","lastName","email","phone"] },
        {
          model:    Agreement, as: "agreements", required: false,
          where:    { status: "signed" },
          include:  [{ model: User, as: "tenant", attributes: ["id","firstName","lastName","email","phone","lastSeenAt"] }],
        },
      ],
    }],
    order: [["createdAt", "DESC"]],
  });

  const now   = new Date();
  const valid = assignments.filter(a => !a.expiresAt || new Date(a.expiresAt) > now);

  return res.json({
    success: true,
    data: valid.map(a => ({
      assignmentId: a.id,
      property:     a.property,
      landlord:     a.property.landlord,
      tenants:      a.property.agreements?.map(ag => ag.tenant) || [],
      permissions: {
        canEditDetails: a.canEditDetails, canManageTenants: a.canManageTenants,
        canViewPayments: a.canViewPayments, canHandleMaintenance: a.canHandleMaintenance,
        canCreateProperty: a.canCreateProperty, canViewTenants: a.canViewTenants,
        canRespondDisputes: a.canRespondDisputes,
      },
      assignedAt: a.createdAt,
      expiresAt:  a.expiresAt,
    })),
  });
});

// ─── GET /api/agents/my-tenants ───────────────────────────────────────────────
// Agent sees all tenants across all their assigned properties
const getMyTenants = safe(async (req, res) => {
  const { Property, AgentProperty, User, Agreement } = getDb();

  const assignments = await AgentProperty.findAll({
    where: { agentId: req.user.id, isActive: true, canViewTenants: true },
    include: [{
      model: Property, as: "property",
      attributes: ["id","title","district","mainImage","rentAmount"],
      include: [{
        model: Agreement, as: "agreements", required: false,
        where: { status: "signed" },
        include: [{
          model: User, as: "tenant",
          attributes: ["id","firstName","lastName","email","phone","lastSeenAt","isVerified"],
        }],
      }],
    }],
  });

  // Flatten to tenant list with property context
  const tenants = [];
  assignments.forEach(a => {
    (a.property.agreements || []).forEach(ag => {
      tenants.push({
        tenant:    ag.tenant,
        property:  { id: a.property.id, title: a.property.title, district: a.property.district },
        agreementId: ag.id,
        since:     ag.createdAt,
      });
    });
  });

  return res.json({ success: true, data: tenants });
});

module.exports = {
  createAgent, assignProperties, revokeProperty,
  updatePermissions, getMyAgents, getAgentDetail,
  getAgentProperties, getMyTenants,
};