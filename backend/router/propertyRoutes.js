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

// ✅ Multer upload middleware (make sure this file exists)
const upload = require("../utils/upload"); 
// Example path could be "../utils/propertyUpload" depending on your project

/**
 * PUBLIC ROUTES
 */
router.get("/", getAllProperties);

// ✅ Put "my" route BEFORE "/:id" so it doesn't get treated as an id
router.get("/my/list", protect, landlordOnly, getMyProperties);

router.get("/:id", getPropertyById);

/**
 * LANDLORD ROUTES (Protected)
 * Upload support:
 * - mainImage: 1 file
 * - images: up to 6 files
 */
router.post(
  "/",
  protect,
  landlordOnly,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 6 },
  ]),
  createPropertyValidation,
  createProperty
);

/**
 * UPDATE PROPERTY
 * Optional upload support too:
 * - If you send new files, it can replace/append depending on your controller logic
 */
router.put(
  "/:id",
  protect,
  landlordOnly,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 6 },
  ]),
  updatePropertyValidation,
  updateProperty
);

router.delete("/:id", protect, landlordOnly, deleteProperty);

module.exports = router;