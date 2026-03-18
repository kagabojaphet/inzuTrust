// controllers/messageController.js
const notificationService = require("../services/notificationService");
const { Op } = require("sequelize");

/**
 * Get all conversations for the current user.
 * A conversation = latest message between user and each contact.
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all unique contact IDs this user has messaged or received from
    const sent = await getDb().Message.findAll({
      where: { senderId: userId, deletedBySender: false },
      attributes: ["receiverId"],
      group: ["receiverId"],
    });
    const received = await getDb().Message.findAll({
      where: { receiverId: userId, deletedByReceiver: false },
      attributes: ["senderId"],
      group: ["senderId"],
    });

    const contactIds = [
      ...new Set([
        ...sent.map(m => m.receiverId),
        ...received.map(m => m.senderId),
      ]),
    ].filter(id => id !== userId);

    // For each contact, get the latest message + unread count
    const conversations = await Promise.all(
      contactIds.map(async (contactId) => {
        const contact = await getDb().User.findByPk(contactId, {
          attributes: ["id", "firstName", "lastName", "role", "email"],
        });
        if (!contact) return null;

        const latest = await getDb().Message.findOne({
          where: {
            [Op.or]: [
              { senderId: userId, receiverId: contactId, deletedBySender: false },
              { senderId: contactId, receiverId: userId, deletedByReceiver: false },
            ],
          },
          order: [["createdAt", "DESC"]],
        });

        const unread = await getDb().Message.count({
          where: { senderId: contactId, receiverId: userId, isRead: false },
        });

        return {
          contact,
          lastMessage: latest,
          unreadCount: unread,
          updatedAt: latest?.createdAt,
        };
      })
    );

    const filtered = conversations
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.json({ success: true, data: filtered });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/messages/:contactId
 * Get full message thread between current user and contactId.
 */
const getThread = async (req, res) => {
  try {
    const userId    = req.user.id;
    const contactId = req.params.contactId;
    const { page = 1, limit = 50 } = req.query;

    const messages = await getDb().Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId,    receiverId: contactId, deletedBySender: false },
          { senderId: contactId, receiverId: userId,    deletedByReceiver: false },
        ],
      },
      order: [["createdAt", "ASC"]],
      limit:  Number(limit),
      offset: (page - 1) * limit,
    });

    // Mark all received messages as read
    await getDb().Message.update(
      { isRead: true, readAt: new Date() },
      { where: { senderId: contactId, receiverId: userId, isRead: false } }
    );

    return res.json({ success: true, data: messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/messages
 * Send a message to another user.
 */
const send = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, text, type = "text", referenceId, referenceType } = req.body;

    if (!receiverId || !text?.trim()) {
      return res.status(400).json({ success: false, message: "receiverId and text are required" });
    }

    const receiver = await getDb().User.findByPk(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: "Recipient not found" });

    const message = await getDb().Message.create({
      senderId, receiverId, text: text.trim(), type,
      referenceId, referenceType,
    });

    // Notify receiver
    const sender = await getDb().User.findByPk(senderId, { attributes: ["firstName", "lastName"] });
    await notificationService.send({
      userId:        receiverId,
      type:          "message_received",
      title:         `New message from ${sender.firstName}`,
      message:       text.length > 80 ? text.substring(0, 80) + "..." : text,
      referenceId:   senderId,
      referenceType: "User",
    });

    return res.status(201).json({ success: true, data: message });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/messages/:id
 * Soft-delete a message for the current user.
 */
const remove = async (req, res) => {
  try {
    const userId  = req.user.id;
    const message = await getDb().Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    if (message.senderId === userId) {
      await message.update({ deletedBySender: true });
    } else if (message.receiverId === userId) {
      await message.update({ deletedByReceiver: true });
    } else {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/messages/contacts/available
 * For landlord: list tenants who applied to their properties.
 * For tenant: list landlords of properties they applied/rented.
 * For admin: all users.
 */
const getAvailableContacts = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let contacts = [];

    if (role === "landlord") {
      const { LeaseApplication } = require("../model");
      const apps = await LeaseApplication.findAll({
        where: { landlordId: userId },
        include: [{ model: User, as: "tenant", attributes: ["id","firstName","lastName","email","role"] }],
        group: ["tenant.id"],
      });
      contacts = [...new Map(apps.map(a => [a.tenant.id, a.tenant])).values()];
    } else if (role === "tenant") {
      const { LeaseApplication } = require("../model");

// Lazy-load DB to avoid circular require on startup
const getDb = () => require("../model");

      const apps = await LeaseApplication.findAll({
        where: { tenantId: userId },
        include: [{ model: User, as: "landlord", attributes: ["id","firstName","lastName","email","role"] }],
        group: ["landlord.id"],
      });
      contacts = [...new Map(apps.map(a => [a.landlord.id, a.landlord])).values()];
    } else {
      // Admin: all users
      contacts = await getDb().User.findAll({
        where: { id: { [Op.ne]: userId } },
        attributes: ["id","firstName","lastName","email","role"],
        limit: 100,
      });
    }

    // Always add admins to everyone's contact list
    if (role !== "admin") {
      const admins = await getDb().User.findAll({
        where: { role: "admin" },
        attributes: ["id","firstName","lastName","email","role"],
      });
      const existing = new Set(contacts.map(c => c.id));
      admins.forEach(a => { if (!existing.has(a.id)) contacts.push(a); });
    }

    return res.json({ success: true, data: contacts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getConversations, getThread, send, remove, getAvailableContacts };