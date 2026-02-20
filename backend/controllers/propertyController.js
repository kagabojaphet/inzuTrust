const propertyService = require("../services/propertyService");
const { validationResult } = require("express-validator");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadToCloudinary = async (filePath, folder = "property_images") => {
  const result = await cloudinary.uploader.upload(filePath, { folder });
  fs.unlinkSync(filePath); // delete local file after upload
  return result.secure_url;
};

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

    const mainImageFile = req.files?.mainImage?.[0] || null;
    const imagesFiles = req.files?.images || [];

    let mainImageUrl = null;
    let imagesUrls = [];

    if (mainImageFile?.path) {
      mainImageUrl = await uploadToCloudinary(
        mainImageFile.path,
        "property_images/main"
      );
    }

    if (imagesFiles.length) {
      imagesUrls = await Promise.all(
        imagesFiles.map((f) =>
          uploadToCloudinary(f.path, "property_images/gallery")
        )
      );
    }

    const payload = {
      ...req.body,
      rentAmount:
        req.body.rentAmount !== undefined && req.body.rentAmount !== ""
          ? Number(req.body.rentAmount)
          : undefined,
      bedrooms:
        req.body.bedrooms !== undefined && req.body.bedrooms !== ""
          ? Number(req.body.bedrooms)
          : undefined,
      bathrooms:
        req.body.bathrooms !== undefined && req.body.bathrooms !== ""
          ? Number(req.body.bathrooms)
          : undefined,

      // ✅ Cloudinary URLs
      mainImage: mainImageUrl,
      images: imagesUrls,
    };

    const created = await propertyService.createProperty(req.user.id, payload);

    return res.status(201).json({
      success: true,
      message: "Property created",
      data: created,
    });
  } catch (error) {
    console.error("createProperty error:", error);

    // best-effort local cleanup if something failed mid-way
    try {
      const files = [
        ...(req.files?.mainImage || []),
        ...(req.files?.images || []),
      ];
      files.forEach((f) => {
        if (f?.path && fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
    } catch (_) {}

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create property",
    });
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

    const mainImageFile = req.files?.mainImage?.[0] || null;
    const imagesFiles = req.files?.images || [];

    const payload = {
      ...req.body,
      rentAmount:
        req.body.rentAmount !== undefined && req.body.rentAmount !== ""
          ? Number(req.body.rentAmount)
          : undefined,
      bedrooms:
        req.body.bedrooms !== undefined && req.body.bedrooms !== ""
          ? Number(req.body.bedrooms)
          : undefined,
      bathrooms:
        req.body.bathrooms !== undefined && req.body.bathrooms !== ""
          ? Number(req.body.bathrooms)
          : undefined,
    };

    if (mainImageFile?.path) {
      payload.mainImage = await uploadToCloudinary(
        mainImageFile.path,
        "property_images/main"
      );
    }

    if (imagesFiles.length) {
      payload.images = await Promise.all(
        imagesFiles.map((f) =>
          uploadToCloudinary(f.path, "property_images/gallery")
        )
      );
    }

    const updated = await propertyService.updateProperty(
      req.params.id,
      req.user.id,
      payload
    );

    return res.status(200).json({
      success: true,
      message: "Property updated",
      data: updated,
    });
  } catch (error) {
    console.error("updateProperty error:", error);

    try {
      const files = [
        ...(req.files?.mainImage || []),
        ...(req.files?.images || []),
      ];
      files.forEach((f) => {
        if (f?.path && fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
    } catch (_) {}

    return res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/properties
const getAllProperties = async (req, res) => {
  try {
    const properties = await propertyService.getAllProperties();
    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
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

// GET /api/properties/my/list
const getMyProperties = async (req, res) => {
  try {
    const properties = await propertyService.getMyProperties(req.user.id);
    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/properties/:id
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