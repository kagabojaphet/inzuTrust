// routes/paymentRoutes.js
const router = require("express").Router();
const ctrl   = require("../controllers/paymentController");
const { protect, landlordOnly, adminOnly } = require("../middleware/authMiddleware");

router.post("/",                protect, landlordOnly, ctrl.create);
router.get("/",                 protect, landlordOnly, ctrl.getLandlordPayments);
router.get("/my",               protect,              ctrl.getTenantPayments);
router.put("/:id/release",      protect, adminOnly,   ctrl.releaseEscrow);
router.get("/admin/all",        protect, adminOnly,   ctrl.adminGetAll);

module.exports = router;