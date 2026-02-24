// controllers/notificationController.js
const { Op } = require("sequelize");
const Notification = require("../model/notificationModel");

// GET /api/notifications?unread=true
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const unread = req.query.unread;
    const where = { userId };
    if (unread === "true") where.isRead = false;

    const items = await Notification.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    const unreadCount = await Notification.count({ where: { userId, isRead: false } });

    return res.json({ success: true, unreadCount, data: items });
  } catch (err) {
    console.error("getMyNotifications error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const notif = await Notification.findByPk(req.params.id);
    if (!notif || Number(notif.userId) !== Number(userId)) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    notif.isRead = true;
    await notif.save();

    return res.json({ success: true, message: "Marked as read", data: notif });
  } catch (err) {
    console.error("markAsRead error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    return res.json({ success: true, message: "All marked as read" });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const notif = await Notification.findByPk(req.params.id);
    if (!notif || Number(notif.userId) !== Number(userId)) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    await notif.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("deleteNotification error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};