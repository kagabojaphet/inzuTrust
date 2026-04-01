// controllers/agentController.js
// All Agent-related operations for Landlord dashboard
// Security model: Relationship-Based (agent can only see/act on assigned properties)
const bcrypt = require("bcryptjs");
const { Op }  = require("sequelize");

const getDb    = () => require("../model");
const audit    = () => require("../services/auditLogService");

// ─── Helpers ─────────────────────────────────────────────────────────────────
const safe = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (err) {
    console.error(`[agentController] ${err.message}`);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/agents/create ─────────────────────────────────────────────────
// Landlord creates a brand-new Agent account (agent does NOT self-register)
const createAgent = safe(async (req, res) => {
  const { User, sequelize } = getDb();
  const { firstName, lastName, email, password, phone } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "firstName, lastName, email, and password are required.",
    });
  }

  // Email must not already be registered
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(400).json({ success: false, message: "Email already registered." });
  }

  const t = await sequelize.transaction();
  try {
    const hashed = await bcrypt.hash(password, 10);

    const agent = await User.create({
      firstName,
      lastName,
      email,
      phone:           phone || null,
      password:        hashed,
      role:            "agent",
      isEmailVerified: true,   // Landlord-created agents skip OTP flow
      isVerified:      false,  // Still needs admin KYC approval
    }, { transaction: t });

    await t.commit();

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
      message: "Agent account created successfully.",
      data: {
        id:        agent.id,
        firstName: agent.firstName,
        lastName:  agent.lastName,
        email:     agent.email,
        role:      agent.role,
        createdAt: agent.createdAt,
      },
    });
  } catch (err) {
    await t.rollback();
    throw err;
  }
});

// ─── POST /api/agents/assign ─────────────────────────────────────────────────
// Landlord assigns an agent to one or more of their properties
const assignProperties = safe(async (req, res) => {
  const { User, Property, AgentProperty } = getDb();
  const { agentId, propertyIds, permissions = {} } = req.body;

  if (!agentId || !Array.isArray(propertyIds) || propertyIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "agentId and a non-empty propertyIds array are required.",
    });
  }

  // Agent must exist and belong to this landlord (or be created by admin)
  const agent = await User.findOne({ where: { id: agentId, role: "agent" } });
  if (!agent) {
    return res.status(404).json({ success: false, message: "Agent not found." });
  }

  const results = [];
  const skipped = [];

  await Promise.all(
    propertyIds.map(async (propId) => {
      // ── Security: landlord MUST own this property ──────────────────────────
      const where = req.user.role === "admin"
        ? { id: propId }
        : { id: propId, landlordId: req.user.id };

      const property = await Property.findOne({ where });
      if (!property) {
        skipped.push(propId);
        return;
      }

      const [assignment, created] = await AgentProperty.findOrCreate({
        where:    { agentId, propertyId: propId },
        defaults: {
          assignedById:        req.user.id,
          canEditDetails:      permissions.canEditDetails      ?? true,
          canManageTenants:    permissions.canManageTenants    ?? true,
          canViewPayments:     permissions.canViewPayments     ?? false,
          canHandleMaintenance:permissions.canHandleMaintenance ?? true,
          isActive:            true,
        },
      });

      // If already existed but was inactive, reactivate it
      if (!created && !assignment.isActive) {
        await assignment.update({ isActive: true, ...permissions });
      }

      results.push({ propertyId: propId, title: property.title, created });
    })
  );

  audit().log.info({
    actorId:   req.user.id,
    actorName: `${req.user.firstName} ${req.user.lastName}`,
    actorRole: req.user.role,
    action:    `Assigned agent ${agent.email} to ${results.length} propert${results.length === 1 ? "y" : "ies"}`,
    target:    agent.email,
    severity:  "INFO",
    sourceIp:  req.ip,
  });

  return res.status(200).json({
    success: true,
    message: `Agent assigned to ${results.length} propert${results.length === 1 ? "y" : "ies"}.${skipped.length ? ` ${skipped.length} skipped (not owned by you).` : ""}`,
    data: { assigned: results, skipped },
  });
});

// ─── DELETE /api/agents/revoke ───────────────────────────────────────────────
// Landlord removes an agent from a specific property
const revokeProperty = safe(async (req, res) => {
  const { Property, AgentProperty } = getDb();
  const { agentId, propertyId } = req.body;

  if (!agentId || !propertyId) {
    return res.status(400).json({ success: false, message: "agentId and propertyId are required." });
  }

  // Verify landlord owns this property
  const where = req.user.role === "admin"
    ? { id: propertyId }
    : { id: propertyId, landlordId: req.user.id };

  const property = await Property.findOne({ where });
  if (!property) {
    return res.status(403).json({ success: false, message: "Property not found or not owned by you." });
  }

  const assignment = await AgentProperty.findOne({ where: { agentId, propertyId } });
  if (!assignment) {
    return res.status(404).json({ success: false, message: "Assignment not found." });
  }

  // Soft-revoke (set isActive = false) to preserve history
  await assignment.update({ isActive: false });

  audit().log.warning({
    actorId:   req.user.id,
    actorName: `${req.user.firstName} ${req.user.lastName}`,
    actorRole: req.user.role,
    action:    `Revoked agent from property: "${property.title}"`,
    target:    `Agent ID: ${agentId}`,
    severity:  "WARNING",
    sourceIp:  req.ip,
  });

  return res.json({ success: true, message: "Agent revoked from property." });
});

// ─── PUT /api/agents/permissions ─────────────────────────────────────────────
// Landlord updates what an agent can do on a specific property
const updatePermissions = safe(async (req, res) => {
  const { Property, AgentProperty } = getDb();
  const { agentId, propertyId, permissions } = req.body;

  if (!agentId || !propertyId || !permissions) {
    return res.status(400).json({ success: false, message: "agentId, propertyId, and permissions are required." });
  }

  // Verify ownership
  const where = req.user.role === "admin"
    ? { id: propertyId }
    : { id: propertyId, landlordId: req.user.id };

  const property = await Property.findOne({ where });
  if (!property) {
    return res.status(403).json({ success: false, message: "Property not found or not owned by you." });
  }

  const assignment = await AgentProperty.findOne({ where: { agentId, propertyId } });
  if (!assignment) {
    return res.status(404).json({ success: false, message: "Assignment not found." });
  }

  // Only update the permission fields that were passed
  const allowed = ["canEditDetails", "canManageTenants", "canViewPayments", "canHandleMaintenance", "isActive", "expiresAt"];
  const updates  = {};
  allowed.forEach(k => { if (k in permissions) updates[k] = permissions[k]; });

  await assignment.update(updates);

  return res.json({
    success: true,
    message: "Permissions updated.",
    data:    assignment,
  });
});

// ─── GET /api/agents ─────────────────────────────────────────────────────────
// Landlord lists all agents they have ever created/assigned, with their properties
const getMyAgents = safe(async (req, res) => {
  const { User, Property, AgentProperty } = getDb();

  // Find all assignments for properties owned by this landlord
  const assignments = await AgentProperty.findAll({
    include: [
      {
        model:      User,
        as:         "agent",
        attributes: ["id", "firstName", "lastName", "email", "phone", "isVerified", "isSuspended", "lastSeenAt", "createdAt"],
      },
      {
        model:      Property,
        as:         "property",
        attributes: ["id", "title", "district", "address", "type", "rentAmount", "status", "mainImage", "verificationStatus"],
        where:      req.user.role === "admin" ? {} : { landlordId: req.user.id },
      },
    ],
    where: { isActive: true },
    order: [["createdAt", "DESC"]],
  });

  // Group assignments by agent
  const agentMap = new Map();
  assignments.forEach(a => {
    const agentId = a.agent.id;
    if (!agentMap.has(agentId)) {
      agentMap.set(agentId, {
        agent:       a.agent.toJSON(),
        properties:  [],
      });
    }
    agentMap.get(agentId).properties.push({
      ...a.property.toJSON(),
      permissions: {
        canEditDetails:       a.canEditDetails,
        canManageTenants:     a.canManageTenants,
        canViewPayments:      a.canViewPayments,
        canHandleMaintenance: a.canHandleMaintenance,
      },
      assignedAt: a.createdAt,
    });
  });

  return res.json({
    success: true,
    data:    [...agentMap.values()],
  });
});

// ─── GET /api/agents/:agentId ─────────────────────────────────────────────────
// Landlord/Admin views a single agent's full profile + assigned properties
const getAgentDetail = safe(async (req, res) => {
  const { User, Property, AgentProperty } = getDb();

  const agent = await User.findOne({
    where:      { id: req.params.agentId, role: "agent" },
    attributes: { exclude: ["password", "otp", "otpExpiry"] },
  });
  if (!agent) {
    return res.status(404).json({ success: false, message: "Agent not found." });
  }

  const assignments = await AgentProperty.findAll({
    where:   { agentId: agent.id, isActive: true },
    include: [{
      model:      Property,
      as:         "property",
      attributes: ["id", "title", "district", "type", "rentAmount", "status", "mainImage", "verificationStatus"],
      where:      req.user.role === "admin" ? {} : { landlordId: req.user.id },
    }],
    order: [["createdAt", "DESC"]],
  });

  return res.json({
    success: true,
    data: {
      agent:       agent.toJSON(),
      assignments: assignments.map(a => ({
        propertyId:   a.propertyId,
        property:     a.property,
        permissions: {
          canEditDetails:       a.canEditDetails,
          canManageTenants:     a.canManageTenants,
          canViewPayments:      a.canViewPayments,
          canHandleMaintenance: a.canHandleMaintenance,
        },
        assignedAt: a.createdAt,
      })),
    },
  });
});

// ─── GET /api/agents/my-properties ───────────────────────────────────────────
// Agent fetches ONLY the properties assigned to them (the core restriction)
const getAgentProperties = safe(async (req, res) => {
  const { Property, AgentProperty, User } = getDb();

  const assignments = await AgentProperty.findAll({
    where:   { agentId: req.user.id, isActive: true },
    include: [{
      model:      Property,
      as:         "property",
      include: [{
        model:      User,
        as:         "landlord",
        attributes: ["id", "firstName", "lastName", "email", "phone"],
      }],
    }],
    order: [["createdAt", "DESC"]],
  });

  // Check expiry and filter out expired assignments
  const now   = new Date();
  const valid = assignments.filter(a => !a.expiresAt || new Date(a.expiresAt) > now);

  return res.json({
    success: true,
    data: valid.map(a => ({
      assignmentId: a.id,
      property:     a.property,
      landlord:     a.property.landlord,
      permissions: {
        canEditDetails:       a.canEditDetails,
        canManageTenants:     a.canManageTenants,
        canViewPayments:      a.canViewPayments,
        canHandleMaintenance: a.canHandleMaintenance,
      },
      assignedAt: a.createdAt,
      expiresAt:  a.expiresAt,
    })),
  });
});

module.exports = {
  createAgent,
  assignProperties,
  revokeProperty,
  updatePermissions,
  getMyAgents,
  getAgentDetail,
  getAgentProperties,
};