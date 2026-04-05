// router/agentRoutes.js
// ⚠️ Named routes MUST come before /:agentId wildcard
const router = require("express").Router();
const ctrl   = require("../controllers/agentController");
const { protect, landlordOnly, agentOnly } = require("../middleware/authMiddleware");

// ── Landlord / Admin ──────────────────────────────────────────────────────────
router.post("/create",     protect, landlordOnly, ctrl.createAgent);
router.post("/assign",     protect, landlordOnly, ctrl.assignProperties);
router.delete("/revoke",   protect, landlordOnly, ctrl.revokeProperty);
router.put("/permissions", protect, landlordOnly, ctrl.updatePermissions);
router.get("/",            protect, landlordOnly, ctrl.getMyAgents);

// ── Agent only — BEFORE /:agentId wildcard ────────────────────────────────────
router.get("/my-properties", protect, agentOnly, ctrl.getAgentProperties);
router.get("/my-tenants",    protect, agentOnly, ctrl.getMyTenants);

// ── Wildcard last ─────────────────────────────────────────────────────────────
router.get("/:agentId", protect, landlordOnly, ctrl.getAgentDetail);

module.exports = router;