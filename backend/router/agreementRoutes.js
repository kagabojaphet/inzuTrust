// router/agreementRoutes.js — COMPLETE with admin + termination routes
// ⚠️ Named routes MUST come before /:id wildcard
const router     = require("express").Router();
const ctrl       = require("../controllers/agreementController");
const { protect, landlordOnly, adminOnly } = require("../middleware/authMiddleware");

// ── Landlord: create + list own agreements ─────────────────────────────────
router.post("/",  protect, landlordOnly, ctrl.create);
router.get("/",   protect, landlordOnly, ctrl.getLandlordAgreements);

// ── Named routes BEFORE /:id wildcard ─────────────────────────────────────
router.get("/all", protect, adminOnly, ctrl.getAllAgreements);  // admin
router.get("/my",  protect,            ctrl.getTenantAgreements); // tenant

// ── Single agreement ───────────────────────────────────────────────────────
router.get("/:id",      protect, ctrl.getById);
router.put("/:id/sign", protect, ctrl.sign);

// ── Termination flow ───────────────────────────────────────────────────────
// Step 1: Either party requests termination (or admin force-terminates)
router.put("/:id/terminate",           protect,            ctrl.terminateAgreement);
// Step 2: Other party responds (accept → auto-terminate | dispute → escalate)
router.put("/:id/termination/respond", protect,            ctrl.respondTermination);
// Step 3: Admin resolves disputed termination
router.put("/:id/termination/resolve", protect, adminOnly, ctrl.resolveTermination);

module.exports = router;