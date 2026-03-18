// services/notificationService.js
// Uses lazy require to avoid circular dependency at load time

function getModel() {
  // Points to your models/index.js which exports the Notification model
  return require("../model").Notification;
}

async function send({ userId, type, title, message, referenceId = null, referenceType = null }) {
  const Notification = getModel();
  return Notification.create({ 
    userId, 
    type, 
    title, 
    message, 
    referenceId, 
    referenceType 
  });
}

async function getForUser(userId, { unreadOnly = false } = {}) {
  const Notification = getModel();
  const where = { userId };
  if (unreadOnly) where.isRead = false;
  return Notification.findAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: 50,
  });
}

async function markRead(notificationId, userId) {
  const Notification = getModel();
  return Notification.update(
    { isRead: true, readAt: new Date() },
    { where: { id: notificationId, userId } }
  );
}

async function markAllRead(userId) {
  const Notification = getModel();
  return Notification.update(
    { isRead: true, readAt: new Date() },
    { where: { userId, isRead: false } }
  );
}

async function unreadCount(userId) {
  const Notification = getModel();
  return Notification.count({ where: { userId, isRead: false } });
}

module.exports = { send, getForUser, markRead, markAllRead, unreadCount };