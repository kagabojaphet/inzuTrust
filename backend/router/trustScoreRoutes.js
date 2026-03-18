// routes/trustScoreRoutes.js
const router = require("express").Router();
const ctrl   = require("../controllers/trustScoreController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/",                      protect,            ctrl.getMy);
router.get("/admin/:tenantId",       protect, adminOnly, ctrl.getByTenant);

module.exports = router;