// router/platformAgreementRoutes.js
const express  = require("express");
const router   = express.Router();
const ctrl     = require("../controllers/platformAgreementController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ── Landlord / Agent ──────────────────────────────────────────────────────────
router.post("/sign",   protect, ctrl.signAgreement);
router.get("/status",  protect, ctrl.getStatus);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/pending",         protect, adminOnly, ctrl.getPending);
router.get("/all",             protect, adminOnly, ctrl.getAll);
router.patch("/:id/countersign", protect, adminOnly, ctrl.countersign);
router.patch("/:id/revoke",      protect, adminOnly, ctrl.revoke);

module.exports = router;