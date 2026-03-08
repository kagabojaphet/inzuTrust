// router/viewingRequestRoutes.js
const express = require("express");
const router = express.Router();

const {
  createViewingRequest,
  getMyViewingRequests,
  getLandlordViewingRequests,
  updateViewingRequestStatus,
} = require("../controllers/viewingRequestController");

const { protect, landlordOnly } = require("../middleware/authMiddleware");

// Tenant routes
router.post("/", protect, createViewingRequest);
router.get("/my", protect, getMyViewingRequests);

// Landlord routes
router.get("/landlord", protect, landlordOnly, getLandlordViewingRequests);
router.put("/:id/status", protect, landlordOnly, updateViewingRequestStatus);

module.exports = router;