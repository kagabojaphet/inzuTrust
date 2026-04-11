// controllers/propertyController.js
const propertyService = require("../services/propertyService");
const { validationResult } = require("express-validator");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const getDb = () => require("../model");

// POST /api/properties (landlord)
const createProperty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.files?.length) req.files.forEach(f => { try { fs.unlinkSync(f.path); } catch (_) {} });
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    let imageUrls = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: "properties" });
        imageUrls.push(result.secure_url);
        try { fs.unlinkSync(file.path); } catch (_) {}
      }
    }

    const created = await propertyService.createProperty(req.user.id, {
      ...req.body,
      mainImage: imageUrls[0] || null,
      images: imageUrls.length ? imageUrls : null,
    });

    return res.status(201).json({ success: true, message: "Property created", data: created });
  } catch (error) {
    if (req.files?.length) req.files.forEach(f => { if (fs.existsSync(f.path)) try { fs.unlinkSync(f.path); } catch (_) {} });
    return res.status(400).json({ success: false, message: error.message || "Failed to create property" });
  }
};

// GET /api/properties (public)
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

// GET /api/properties/:id (public)
const getPropertyById = async (req, res) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    return res.json({ success: true, data: property });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

// ── GET /api/properties/my/list (landlord) ─────────────────────────────────
// Enhanced: includes active tenant from signed agreement for each property
const getMyProperties = async (req, res) => {
  try {
    const { Agreement, User } = getDb();
    const { Op } = require("sequelize");

    // Base property list
    const properties = await propertyService.getMyProperties(req.user.id);

    if (!properties?.length) return res.json({ success: true, data: [] });

    const propertyIds = properties.map(p => p.id);

    // Find all active (signed/active) agreements for these properties
    const agreements = await Agreement.findAll({
      where: {
        propertyId: { [Op.in]: propertyIds },
        status: { [Op.notIn]: ["rejected", "cancelled", "expired", "terminated", "draft"] },
      },
      include: [{
        model: User,
        as: "tenant",
        attributes: ["id","firstName","lastName","email","lastSeenAt"],
      }],
      order: [["createdAt","DESC"]],
    });

    // Map propertyId → first active tenant
    const tenantMap = new Map();
    agreements.forEach(a => {
      if (a.tenant && !tenantMap.has(a.propertyId)) {
        tenantMap.set(a.propertyId, {
          id:        a.tenant.id,
          firstName: a.tenant.firstName,
          lastName:  a.tenant.lastName,
          email:     a.tenant.email,
          lastSeenAt:a.tenant.lastSeenAt,
          since:     a.signedAt || a.createdAt,
        });
      }
    });

    // Enrich each property with its active tenant
    const enriched = properties.map(p => ({
      ...(p.toJSON ? p.toJSON() : p),
      activeTenant: tenantMap.get(p.id) || null,
    }));

    return res.json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/properties/:id (landlord or agent with canEditDetails)
const updateProperty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }
    const updated = await propertyService.updateProperty(req.params.id, req.user.id, req.body);
    return res.json({ success: true, message: "Property updated", data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/properties/:id (landlord)
const deleteProperty = async (req, res) => {
  try {
    await propertyService.deleteProperty(req.params.id, req.user.id);
    return res.json({ success: true, message: "Property deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createProperty, getAllProperties, getPropertyById, getMyProperties, updateProperty, deleteProperty };