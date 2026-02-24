// router/notificationRoutes.js
const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

router.get("/", protect, notificationController.getMyNotifications);
router.patch("/:id/read", protect, notificationController.markAsRead);
router.patch("/read-all", protect, notificationController.markAllAsRead);
router.delete("/:id", protect, notificationController.deleteNotification);

module.exports = router;