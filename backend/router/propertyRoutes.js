// router/propertyRoutes.js
const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

const { protect, landlordOnly } = require("../middleware/authMiddleware");
const {
  createPropertyValidation,
  updatePropertyValidation,
} = require("../validator/propertyValidator");

// Public
router.get("/", getAllProperties);

// ✅ IMPORTANT: put this BEFORE "/:id"
router.get("/my/list", protect, landlordOnly, getMyProperties);

router.get("/:id", getPropertyById);

// Landlord-only + images upload (up to 6 files)
router.post(
  "/",
  protect,
  landlordOnly,
  upload.array("images", 6),
  createPropertyValidation,
  createProperty
);

router.put("/:id", protect, landlordOnly, updatePropertyValidation, updateProperty);
router.delete("/:id", protect, landlordOnly, deleteProperty);

module.exports = router;