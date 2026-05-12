// router/propertyRoutes.js
const express = require("express");
const router  = express.Router();
const upload  = require("../middleware/uploadMiddleware");

const {
  createProperty, getAllProperties, getPropertyById,
  getMyProperties, getAgentOwnListings, getAgentAssignedProperties,
  updateProperty, deleteProperty,
} = require("../controllers/propertyController");

const {
  addReview, getReviews, deleteReview,
} = require("../controllers/propertyReviewController");

const {
  protect, landlordOnly, canManageProperty, requirePermission,
} = require("../middleware/authMiddleware");

const {
  createPropertyValidation, updatePropertyValidation,
} = require("../validator/propertyValidator");

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getAllProperties);

// ── Named routes BEFORE /:id wildcard ─────────────────────────────────────────
router.get("/my/list",          protect, landlordOnly, getMyProperties);
router.get("/agent/my-listings", protect, getAgentOwnListings);
router.get("/agent/assigned",    protect, getAgentAssignedProperties);

// ── Single property (public) ──────────────────────────────────────────────────
router.get("/:id", getPropertyById);

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get("/:id/reviews",  getReviews);
router.post("/:id/reviews", protect, addReview);
router.delete("/:propertyId/reviews/:reviewId", protect, deleteReview);

// ── Create: landlord OR agent, role resolved inside service ───────────────────
router.post(
  "/",
  protect,
  upload.array("images", 6),
  createPropertyValidation,
  createProperty
);

// ── Delete: landlord only ─────────────────────────────────────────────────────
router.delete("/:id", protect, landlordOnly, deleteProperty);

// ── Update: landlord OR assigned agent with canEditDetails ────────────────────
router.put(
  "/:id",
  protect,
  canManageProperty,
  requirePermission("canEditDetails"),
  updatePropertyValidation,
  updateProperty
);

module.exports = router;