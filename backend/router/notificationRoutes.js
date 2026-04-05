// router/notificationRoutes.js
const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const svc = () => require("../services/notificationService");

// GET /api/notifications — all for current user
router.get("/", protect, async (req, res) => {
  try {
    const { unreadOnly = "false", limit = "30" } = req.query;
    const items = await svc().getForUser(req.user.id, {
      unreadOnly: unreadOnly === "true",
      limit: Math.min(parseInt(limit) || 30, 100),
    });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/notifications/unread-count
router.get("/unread-count", protect, async (req, res) => {
  try {
    const count = await svc().unreadCount(req.user.id);
    return res.json({ success: true, count });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", protect, async (req, res) => {
  try {
    await svc().markRead(req.params.id, req.user.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/read-all
router.put("/read-all", protect, async (req, res) => {
  try {
    await svc().markAllRead(req.user.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/notifications/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const { Notification } = require("../model");
    await Notification.destroy({ where: { id: req.params.id, userId: req.user.id } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;