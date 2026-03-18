// routes/disputeRoutes.js
const router = require("express").Router();
const ctrl   = require("../controllers/disputeController");
const upload = require("../middleware/uploadMiddleware");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/",                      protect,            ctrl.create);
router.get("/my",                     protect,            ctrl.getMy);
router.get("/:id",                    protect,            ctrl.getById);
router.post("/:id/messages",          protect,            ctrl.sendMessage);
router.post("/:id/evidence",          protect, upload.array("files", 5), ctrl.uploadEvidence);
router.put("/:id/stage",              protect, adminOnly, ctrl.advanceStage);
router.put("/:id/resolve",            protect, adminOnly, ctrl.resolve);
router.get("/admin/all",              protect, adminOnly, ctrl.adminGetAll);

module.exports = router;