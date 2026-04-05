// services/notificationService.js
function getModel() { return require("../model").Notification; }

async function send({ userId, type, title, message, referenceId = null, referenceType = null }) {
  try {
    return await getModel().create({ userId, type, title, message, referenceId, referenceType });
  } catch (e) {
    console.warn("[NotificationService] send failed:", e.message);
  }
}

// Send to multiple users at once
async function sendMany(userIds, payload) {
  return Promise.all(userIds.filter(Boolean).map(userId => send({ userId, ...payload })));
}

async function getForUser(userId, { unreadOnly = false, limit = 30 } = {}) {
  const where = { userId };
  if (unreadOnly) where.isRead = false;
  return getModel().findAll({ where, order: [["createdAt", "DESC"]], limit });
}

async function markRead(notificationId, userId) {
  return getModel().update(
    { isRead: true, readAt: new Date() },
    { where: { id: notificationId, userId } }
  );
}

async function markAllRead(userId) {
  return getModel().update(
    { isRead: true, readAt: new Date() },
    { where: { userId, isRead: false } }
  );
}

async function unreadCount(userId) {
  return getModel().count({ where: { userId, isRead: false } });
}

module.exports = { send, sendMany, getForUser, markRead, markAllRead, unreadCount };