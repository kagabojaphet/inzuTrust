// router/propertyRoutes.js
// Updated to enforce agent relationship-based access
const express = require("express");
const router  = express.Router();
const upload  = require("../middleware/uploadMiddleware");

const {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

const {
  protect,
  landlordOnly,
  canManageProperty,
  requirePermission,
} = require("../middleware/authMiddleware");

const {
  createPropertyValidation,
  updatePropertyValidation,
} = require("../validator/propertyValidator");

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getAllProperties);

// ── IMPORTANT: named routes before /:id wildcard ──────────────────────────────
router.get("/my/list", protect, landlordOnly, getMyProperties);

router.get("/:id", getPropertyById);

// ── Landlord only (create + delete) ──────────────────────────────────────────
router.post(
  "/",
  protect,
  landlordOnly,
  upload.array("images", 6),
  createPropertyValidation,
  createProperty
);

router.delete("/:id", protect, landlordOnly, deleteProperty);

// ── Landlord OR Agent (update) ────────────────────────────────────────────────
// canManageProperty: landlord owns it, or agent is assigned to it
// requirePermission("canEditDetails"): agent must also have edit rights
router.put(
  "/:id",
  protect,
  canManageProperty,
  requirePermission("canEditDetails"),
  updatePropertyValidation,
  updateProperty
);

module.exports = router;