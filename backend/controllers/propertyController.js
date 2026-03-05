// controllers/propertyController.js
const propertyService = require("../services/propertyService");
const { validationResult } = require("express-validator");

const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// POST /api/properties (landlord)
const createProperty = async (req, res) => {
  try {
    const errors = validationResult(req);

    // If validation fails, clean local temp uploaded files
    if (!errors.isEmpty()) {
      if (req.files?.length) {
        req.files.forEach((f) => {
          try {
            fs.unlinkSync(f.path);
          } catch (_) {}
        });
      }

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    let imageUrls = [];

    // ✅ Upload images to Cloudinary if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "properties",
        });

        imageUrls.push(uploadResult.secure_url);

        // delete local file after upload
        try {
          fs.unlinkSync(file.path);
        } catch (_) {}
      }
    }

    const payload = {
      ...req.body,
      mainImage: imageUrls[0] || null,
      images: imageUrls.length ? imageUrls : null,
    };

    const created = await propertyService.createProperty(req.user.id, payload);

    return res.status(201).json({
      success: true,
      message: "Property created",
      data: created,
    });
  } catch (error) {
    // cleanup if failure
    if (req.files?.length) {
      req.files.forEach((f) => {
        if (fs.existsSync(f.path)) {
          try {
            fs.unlinkSync(f.path);
          } catch (_) {}
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create property",
    });
  }
};

// GET /api/properties (public)
const getAllProperties = async (req, res) => {
  try {
    const properties = await propertyService.getAllProperties();
    return res.json({ success: true, data: properties });
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

// GET /api/properties/my/list (landlord)
const getMyProperties = async (req, res) => {
  try {
    const properties = await propertyService.getMyProperties(req.user.id);
    return res.json({ success: true, data: properties });
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

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
};