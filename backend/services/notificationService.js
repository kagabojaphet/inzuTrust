// services/notificationService.js
const Notification = require("../model/notificationModel");

async function notify(userId, { type, title, message, data = null }) {
  if (!userId) return null;

  const created = await Notification.create({
    userId,
    type,
    title,
    message,
    data,
    isRead: false,
  });

  // Later: push real-time via socket.io here (optional)
  return created;
}


module.exports = { notify };