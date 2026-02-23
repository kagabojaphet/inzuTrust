const express = require("express");
const router = express.Router();

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

// Public (or keep it protected if you want)
router.get("/", getAllProperties);
router.get("/:id", getPropertyById);

// Landlord-only
router.post("/", protect, landlordOnly, createPropertyValidation, createProperty);

router.get("/my/list", protect, landlordOnly, getMyProperties);
router.put("/:id", protect, landlordOnly, updatePropertyValidation, updateProperty);
router.delete("/:id", protect, landlordOnly, deleteProperty);

module.exports = router;
