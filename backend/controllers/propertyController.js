const propertyService = require("../services/propertyService");
const { validationResult } = require("express-validator");

// POST /api/properties (landlord)
const createProperty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const created = await propertyService.createProperty(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Property created",
      data: created,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create property",
    });
  }
};

// GET /api/properties (public or protected - your choice)
const getAllProperties = async (req, res) => {
  try {
    const properties = await propertyService.getAllProperties();
    return res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/properties/:id
const getPropertyById = async (req, res) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    return res.status(200).json({ success: true, data: property });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

// GET /api/properties/my (landlord)
const getMyProperties = async (req, res) => {
  try {
    const properties = await propertyService.getMyProperties(req.user.id);
    return res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/properties/:id (landlord)
const updateProperty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const updated = await propertyService.updateProperty(
      req.params.id,
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Property updated",
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/properties/:id (landlord)
const deleteProperty = async (req, res) => {
  try {
    await propertyService.deleteProperty(req.params.id, req.user.id);
    return res.status(200).json({ success: true, message: "Property deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
};
