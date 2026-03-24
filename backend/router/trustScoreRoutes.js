// router/trustScoreRoutes.js
const router = require("express").Router();
const ctrl   = require("../controllers/trustScoreController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Tenant — their own score + chart data + breakdown
router.get("/",                    protect,            ctrl.getMy);

// Admin — view any tenant's score
router.get("/admin/:tenantId",     protect, adminOnly, ctrl.getByTenant);

module.exports = router;