// controllers/notificationController.js
const notificationService = require("../services/notificationService");

// GET /api/notifications
const getAll = async (req, res) => {
  try {
    const { unread } = req.query;
    const notifications = await notificationService.getForUser(
      req.user.id,
      { unreadOnly: unread === "true" }
    );
    const count = await notificationService.unreadCount(req.user.id);
    return res.json({ success: true, unreadCount: count, data: notifications });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    await notificationService.markRead(req.params.id, req.user.id);
    return res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await notificationService.markAllRead(req.user.id);
    return res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, markRead, markAllRead };