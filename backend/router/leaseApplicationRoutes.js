// router/leaseApplicationRoutes.js — COMPLETE with admin getAllApplications
// ⚠️ Named routes MUST come before /:id wildcard
const router = require("express").Router();
const ctrl   = require("../controllers/leaseApplicationController");
const { protect, tenantOnly, landlordOnly, adminOnly } = require("../middleware/authMiddleware");

// ── Named routes (before wildcard) ────────────────────────────────────────
router.get("/all",      protect, adminOnly,   ctrl.getAllApplications); // admin
router.get("/my",       protect, tenantOnly,  ctrl.getMyApplications); // tenant
router.get("/received", protect, landlordOnly,ctrl.getReceived);        // landlord

// ── Tenant applies ────────────────────────────────────────────────────────
router.post("/", protect, tenantOnly, ctrl.apply);

// ── Landlord responds ─────────────────────────────────────────────────────
router.put("/:id/respond", protect, landlordOnly, ctrl.respond);

module.exports = router;