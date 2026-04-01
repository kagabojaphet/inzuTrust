// router/maintenanceRoutes.js
const router = require("express").Router();
const ctrl   = require("../controllers/maintenanceController");
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");

// ── Stats (before /:id wildcard) ──────────────────────────────────────────────
router.get("/stats", protect, ctrl.getStats);

// ── Core CRUD ─────────────────────────────────────────────────────────────────
router.post(
  "/",
  protect,
  upload.array("images", 5),   // tenant can attach up to 5 photos
  ctrl.createRequest
);

router.get("/",      protect, ctrl.listRequests);
router.get("/:id",   protect, ctrl.getRequest);

// ── Status lifecycle ──────────────────────────────────────────────────────────
router.put("/:id/status", protect, ctrl.updateStatus);

// ── Agent assignment ──────────────────────────────────────────────────────────
router.put("/:id/assign", protect, ctrl.assignAgent);

// ── Comment thread ────────────────────────────────────────────────────────────
router.post(
  "/:id/comments",
  protect,
  upload.array("attachments", 3),
  ctrl.addComment
);

// ── Tenant rating ─────────────────────────────────────────────────────────────
router.post("/:id/rate", protect, ctrl.rateResolution);

module.exports = router;