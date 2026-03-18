// routes/leaseApplicationRoutes.js
const router = require("express").Router();
const ctrl   = require("../controllers/leaseApplicationController");
const { protect, tenantOnly, landlordOnly } = require("../middleware/authMiddleware");

router.post("/",           protect, tenantOnly,   ctrl.apply);
router.get("/my",          protect, tenantOnly,   ctrl.getMyApplications);
router.get("/received",    protect, landlordOnly, ctrl.getReceived);
router.put("/:id/respond", protect, landlordOnly, ctrl.respond);

module.exports = router;