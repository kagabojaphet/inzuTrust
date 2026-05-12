// router/listingAgreementRoutes.js
const express  = require("express");
const router   = express.Router();
const { protect } = require("../middleware/authMiddleware");
const service  = require("../services/listingAgreementService");

// GET  /api/listing-agreement/status
router.get("/status", protect, async (req, res) => {
  try {
    const status = await service.getAgreementStatus(req.user.id);
    return res.json({ success: true, data: status });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
});

// POST /api/listing-agreement/accept
// Body: { acceptedTerms: ["accurateInformation", "ownershipOrAuthorization", ...all 8] }
router.post("/accept", protect, async (req, res) => {
  try {
    const result = await service.acceptAgreement(req.user.id, req.body);
    return res.json({ success: true, data: result });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;