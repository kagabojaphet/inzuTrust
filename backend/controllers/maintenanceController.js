// controllers/maintenanceController.js — KEY FIX: accept "signed" OR "active" agreement status
const cloudinary = require("../config/cloudinary");
const fs         = require("fs");
const { Op }     = require("sequelize");

const getDb  = () => require("../model");
const audit  = () => require("../services/auditLogService");
const notify = () => require("../services/notificationService");

async function postSystemNote(requestId, text) {
  const { MaintenanceComment } = getDb();
  await MaintenanceComment.create({ requestId, authorId: null, text, isSystemNote: true });
}

async function notifyParties({ request, title, message, excludeId }) {
  const svc = notify();
  const ids = [request.tenantId, request.landlordId, request.assignedAgentId]
    .filter(id => id && id !== excludeId);
  await Promise.all(ids.map(uid =>
    svc.send({ userId: uid, type: "maintenance_update", title, message,
      referenceId: request.id, referenceType: "MaintenanceRequest" }).catch(() => {})
  ));
}

// ─── POST /api/maintenance ────────────────────────────────────────────────────
const createRequest = async (req, res) => {
  try {
    const { MaintenanceRequest, Property, Agreement } = getDb();
    const tenantId = req.user.id;
    const { propertyId, title, description, category = "other", priority = "medium" } = req.body;

    if (!propertyId || !title || !description) {
      return res.status(400).json({ success: false, message: "propertyId, title, and description are required." });
    }

    // ── FIXED: Accept "signed" OR "active" so both naming conventions work ──
    const agreement = await Agreement.findOne({
      where: {
        tenantId,
        propertyId,
        status: { [Op.in]: ["signed", "active", "approved"] },
      },
    });

    if (!agreement) {
      const tenantAgreements = await Agreement.findAll({
        where:      { tenantId },
        attributes: ["id","propertyId","status","createdAt"],
      });
      return res.status(403).json({
        success: false,
        message: "You can only file maintenance requests for properties you are actively renting. Ensure your lease agreement is signed.",
        debug: {
          tenantId,
          requestedPropertyId: propertyId,
          yourAgreements: tenantAgreements,
        },
      });
    }

    const property = await Property.findByPk(propertyId);
    if (!property) return res.status(404).json({ success: false, message: "Property not found." });

    let images = [];
    if (req.files?.length) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, { folder: "maintenance" });
          images.push(result.secure_url);
        } finally { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); }
      }
    }

    const request = await MaintenanceRequest.create({
      propertyId, tenantId, landlordId: property.landlordId,
      title: title.trim(), description: description.trim(),
      category, priority, images: images.length ? images : null,
    });

    await notifyParties({ request, title:"🔧 New Maintenance Request", message:`${req.user.firstName} filed: "${title}"`, excludeId: tenantId });

    audit().log.info({
      actorId: tenantId, actorName:`${req.user.firstName} ${req.user.lastName}`,
      actorRole:"tenant", action:`Filed maintenance request: "${title}"`,
      target:`Property: ${property.title}`, sourceIp: req.ip,
    });

    return res.status(201).json({ success: true, data: request });
  } catch (err) {
    if (req.files?.length) req.files.forEach(f => { try { fs.unlinkSync(f.path); } catch(_) {} });
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/maintenance ─────────────────────────────────────────────────────
const listRequests = async (req, res) => {
  try {
    const { MaintenanceRequest, Property, User } = getDb();
    const { role, id: userId } = req.user;
    const { status, priority, category, page = 1, limit = 50 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where  = {};

    if (role === "tenant")   where.tenantId        = userId;
    if (role === "landlord") where.landlordId       = userId;
    if (role === "agent")    where.assignedAgentId  = userId;

    if (status)   where.status   = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;

    const { count, rows } = await MaintenanceRequest.findAndCountAll({
      where,
      include: [
        { model: User,     as: "tenant",       attributes: ["id","firstName","lastName","email","phone"] },
        { model: User,     as: "landlord",      attributes: ["id","firstName","lastName","email","phone"] },
        { model: User,     as: "assignedAgent", attributes: ["id","firstName","lastName","email"], required: false },
        { model: Property, as: "property",      attributes: ["id","title","district","address","mainImage"] },
      ],
      order: [
        [require("sequelize").literal(`FIELD(priority,'emergency','high','medium','low')`), "ASC"],
        ["createdAt","DESC"],
      ],
      limit: Number(limit), offset, distinct: true,
    });

    return res.json({
      success: true, data: rows,
      pagination: { total: count, page: Number(page), totalPages: Math.ceil(count / Number(limit)) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/maintenance/:id ─────────────────────────────────────────────────
const getRequest = async (req, res) => {
  try {
    const { MaintenanceRequest, MaintenanceComment, Property, User } = getDb();
    const { role, id: userId } = req.user;

    const request = await MaintenanceRequest.findByPk(req.params.id, {
      include: [
        { model: User,     as: "tenant",       attributes: ["id","firstName","lastName","email","phone"] },
        { model: User,     as: "landlord",      attributes: ["id","firstName","lastName","email","phone"] },
        { model: User,     as: "assignedAgent", attributes: ["id","firstName","lastName","email"], required: false },
        { model: Property, as: "property",      attributes: ["id","title","district","address","mainImage"] },
        {
          model: MaintenanceComment, as: "comments",
          include: [{ model: User, as: "author", attributes: ["id","firstName","lastName","role"] }],
          order:   [["createdAt","ASC"]],
        },
      ],
    });

    if (!request) return res.status(404).json({ success: false, message: "Request not found." });

    const isAllowed = role === "admin" ||
      request.tenantId === userId || request.landlordId === userId ||
      request.assignedAgentId === userId;

    if (!isAllowed) return res.status(403).json({ success: false, message: "Access denied." });

    return res.json({ success: true, data: request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/maintenance/:id/status ─────────────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    const { MaintenanceRequest } = getDb();
    const { role, id: userId } = req.user;
    const { status, resolutionNote, scheduledAt } = req.body;

    const VALID = ["acknowledged","in_progress","resolved","rejected","cancelled"];
    if (!VALID.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be: ${VALID.join(", ")}` });
    }

    const request = await MaintenanceRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });

    const isLandlord = role === "landlord" && request.landlordId      === userId;
    const isAgent    = role === "agent"    && request.assignedAgentId === userId;
    const isTenant   = role === "tenant"   && request.tenantId        === userId;
    const isAdmin    = role === "admin";

    if (isTenant) {
      if (status !== "cancelled") return res.status(403).json({ success: false, message: "Tenants can only cancel their own requests." });
      if (!["open","acknowledged"].includes(request.status))
        return res.status(400).json({ success: false, message: "You can only cancel open or acknowledged requests." });
    } else {
      if (!isLandlord && !isAgent && !isAdmin)
        return res.status(403).json({ success: false, message: "Access denied." });
      if (["resolved","rejected"].includes(request.status) && !isAdmin)
        return res.status(400).json({ success: false, message: "This request is already closed." });
    }

    const updates = { status };
    if (scheduledAt)    updates.scheduledAt    = scheduledAt;
    if (resolutionNote) updates.resolutionNote = resolutionNote;
    if (status === "resolved") updates.resolvedAt = new Date();

    await request.update(updates);

    const noteText = {
      acknowledged: `Request acknowledged by ${req.user.firstName}.`,
      in_progress:  `Work started by ${req.user.firstName}${scheduledAt ? `. Scheduled: ${new Date(scheduledAt).toLocaleDateString()}` : ""}.`,
      resolved:     `Marked resolved by ${req.user.firstName}. ${resolutionNote || ""}`,
      rejected:     `Request rejected by ${req.user.firstName}. ${resolutionNote || ""}`,
      cancelled:    `Cancelled by ${req.user.firstName}.`,
    }[status] || `Status updated to ${status}.`;

    await postSystemNote(request.id, noteText);
    await notifyParties({ request, title:`Maintenance Update: ${request.title}`, message: noteText, excludeId: userId });

    return res.json({ success: true, message: "Status updated.", data: request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/maintenance/:id/assign ─────────────────────────────────────────
const assignAgent = async (req, res) => {
  try {
    const { MaintenanceRequest, User, AgentProperty } = getDb();
    const { agentId } = req.body;

    const request = await MaintenanceRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });

    if (req.user.role !== "admin" && request.landlordId !== req.user.id)
      return res.status(403).json({ success: false, message: "Only the property landlord can assign an agent." });

    const agent = await User.findOne({ where: { id: agentId, role: "agent" } });
    if (!agent) return res.status(404).json({ success: false, message: "Agent not found." });

    await request.update({ assignedAgentId: agentId, status: "acknowledged" });
    await postSystemNote(request.id, `Assigned to agent: ${agent.firstName} ${agent.lastName}.`);

    notify().send({
      userId: agentId, type: "maintenance_assigned",
      title: "🔧 Maintenance Task Assigned",
      message: `You have been assigned: "${request.title}"`,
      referenceId: request.id, referenceType: "MaintenanceRequest",
    }).catch(() => {});

    return res.json({ success: true, message: "Agent assigned.", data: request });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/maintenance/:id/comments ──────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const { MaintenanceRequest, MaintenanceComment } = getDb();
    const { text } = req.body;
    const { id: userId, role } = req.user;

    if (!text?.trim()) return res.status(400).json({ success: false, message: "Comment text is required." });

    const request = await MaintenanceRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });

    const allowed = role === "admin" ||
      request.tenantId === userId || request.landlordId === userId ||
      request.assignedAgentId === userId;

    if (!allowed) return res.status(403).json({ success: false, message: "Access denied." });

    const comment = await MaintenanceComment.create({
      requestId: request.id, authorId: userId, text: text.trim(),
    });

    await notifyParties({
      request, title: `Comment on: ${request.title}`,
      message: `${req.user.firstName}: ${text.slice(0, 80)}`, excludeId: userId,
    });

    return res.status(201).json({ success: true, data: comment });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/maintenance/:id/rate ──────────────────────────────────────────
const rateResolution = async (req, res) => {
  try {
    const { MaintenanceRequest } = getDb();
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ success: false, message: "Rating must be 1–5." });

    const request = await MaintenanceRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    if (request.tenantId !== req.user.id) return res.status(403).json({ success: false, message: "Only the filing tenant can rate this." });
    if (request.status !== "resolved") return res.status(400).json({ success: false, message: "You can only rate resolved requests." });
    if (request.tenantRating) return res.status(400).json({ success: false, message: "You have already rated this request." });

    await request.update({ tenantRating: rating, tenantFeedback: feedback || null });
    return res.json({ success: true, message: "Thank you for your feedback!" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/maintenance/stats ───────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const { MaintenanceRequest } = getDb();
    const { role, id: userId } = req.user;

    const scope = role === "landlord" ? { landlordId: userId }
                : role === "agent"    ? { assignedAgentId: userId }
                : role === "tenant"   ? { tenantId: userId }
                : {};

    const [total, open, inProgress, resolved, emergency] = await Promise.all([
      MaintenanceRequest.count({ where: scope }),
      MaintenanceRequest.count({ where: { ...scope, status: "open" } }),
      MaintenanceRequest.count({ where: { ...scope, status: "in_progress" } }),
      MaintenanceRequest.count({ where: { ...scope, status: "resolved" } }),
      MaintenanceRequest.count({ where: { ...scope, priority: "emergency" } }),
    ]);

    const ratingRows = await MaintenanceRequest.findAll({
      where: { ...scope, tenantRating: { [Op.not]: null } },
      attributes: [[require("sequelize").fn("AVG", require("sequelize").col("tenantRating")), "avgRating"]],
      raw: true,
    });

    return res.json({
      success: true,
      data: { total, open, inProgress, resolved, emergency, avgRating: parseFloat(ratingRows[0]?.avgRating || 0).toFixed(1) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createRequest, listRequests, getRequest, updateStatus, assignAgent, addComment, rateResolution, getStats };