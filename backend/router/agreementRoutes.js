// routes/agreementRoutes.js
const router = require("express").Router();
const ctrl   = require("../controllers/agreementController");
const { protect, landlordOnly } = require("../middleware/authMiddleware");

router.post("/",           protect, landlordOnly, ctrl.create);
router.get("/",            protect, landlordOnly, ctrl.getLandlordAgreements);
router.get("/my",          protect,              ctrl.getTenantAgreements);
router.get("/:id",         protect,              ctrl.getById);
router.put("/:id/sign",    protect,              ctrl.sign);

module.exports = router;