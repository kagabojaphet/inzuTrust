// controllers/propertyController.js
const propertyService = require("../services/propertyService");
const { validationResult } = require("express-validator");
const cloudinary = require("../config/cloudinary");
const fs         = require("fs");

const getDb = () => require("../model");

const cleanupFiles = (files = []) =>
  files.forEach((f) => { try { fs.unlinkSync(f.path); } catch (_) {} });

const uploadImages = async (files = []) => {
  const urls = [];
  for (const file of files) {
    const result = await cloudinary.uploader.upload(file.path, { folder: "properties" });
    urls.push(result.secure_url);
    try { fs.unlinkSync(file.path); } catch (_) {}
  }
  return urls;
};

// ── POST /api/properties ──────────────────────────────────────────────────────
// Landlord OR Agent (role-aware inside service)
const createProperty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      cleanupFiles(req.files);
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const imageUrls = await uploadImages(req.files);

    const created = await propertyService.createProperty(
      req.user.id,
      req.user.role,          // "landlord" | "agent"
      {
        ...req.body,
        mainImage: imageUrls[0] || null,
        images:    imageUrls.length ? imageUrls : null,
      }
    );

    return res.status(201).json({ success: true, message: "Property created", data: created });
  } catch (error) {
    cleanupFiles(req.files);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ── GET /api/properties ───────────────────────────────────────────────────────
const getAllProperties = async (req, res) => {
  try {
    const result = await propertyService.getAllProperties(req.query);
    return res.json({
      success: true, total: result.total, page: result.page,
      limit: result.limit, totalPages: result.totalPages, data: result.properties,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/properties/:id ───────────────────────────────────────────────────
const getPropertyById = async (req, res) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    return res.json({ success: true, data: property });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

// ── GET /api/properties/my/list  (landlord) ───────────────────────────────────
const getMyProperties = async (req, res) => {
  try {
    const { Agreement, User } = getDb();
    const { Op } = require("sequelize");

    const properties = await propertyService.getMyProperties(req.user.id);
    if (!properties?.length) return res.json({ success: true, data: [] });

    const propertyIds = properties.map((p) => p.id);
    const agreements  = await Agreement.findAll({
      where: {
        propertyId: { [Op.in]: propertyIds },
        status:     { [Op.notIn]: ["rejected","cancelled","expired","terminated","draft"] },
      },
      include: [{
        model: User, as: "tenant",
        attributes: ["id","firstName","lastName","email","lastSeenAt"],
      }],
      order: [["createdAt","DESC"]],
    });

    const tenantMap = new Map();
    agreements.forEach((a) => {
      if (a.tenant && !tenantMap.has(a.propertyId)) {
        tenantMap.set(a.propertyId, {
          id: a.tenant.id, firstName: a.tenant.firstName,
          lastName: a.tenant.lastName, email: a.tenant.email,
          lastSeenAt: a.tenant.lastSeenAt, since: a.signedAt || a.createdAt,
        });
      }
    });

    const enriched = properties.map((p) => ({
      ...(p.toJSON ? p.toJSON() : p),
      activeTenant: tenantMap.get(p.id) || null,
    }));

    return res.json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/properties/agent/my-listings  (agent) ───────────────────────────
// Properties the agent created themselves (own + on-behalf-of)
const getAgentOwnListings = async (req, res) => {
  try {
    const properties = await propertyService.getAgentOwnListings(req.user.id);
    return res.json({ success: true, data: properties });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/properties/agent/assigned  (agent) ───────────────────────────────
// Properties a landlord assigned to this agent
const getAgentAssignedProperties = async (req, res) => {
  try {
    const properties = await propertyService.getAgentAssignedProperties(req.user.id);
    return res.json({ success: true, data: properties });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT /api/properties/:id ───────────────────────────────────────────────────
// canManageProperty middleware verified access — do NOT pass landlordId here
const updateProperty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const updated = await propertyService.updateProperty(req.params.id, req.body);
    return res.json({ success: true, message: "Property updated", data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/properties/:id  (landlord only) ───────────────────────────────
const deleteProperty = async (req, res) => {
  try {
    await propertyService.deleteProperty(req.params.id, req.user.id);
    return res.json({ success: true, message: "Property deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProperty, getAllProperties, getPropertyById,
  getMyProperties, getAgentOwnListings, getAgentAssignedProperties,
  updateProperty, deleteProperty,
};