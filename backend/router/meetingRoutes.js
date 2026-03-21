// router/meetingRoutes.js
const router = require("express").Router();
const ctrl   = require("../controllers/meetingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/",             protect, ctrl.create);
router.get("/",              protect, ctrl.getMyMeetings);
router.put("/:id/confirm",   protect, ctrl.confirm);
router.put("/:id/cancel",    protect, ctrl.cancel);

module.exports = router;