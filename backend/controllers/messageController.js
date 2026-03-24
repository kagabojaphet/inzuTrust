// controllers/messageController.js
const notificationService = require("../services/notificationService");
const { Op } = require("sequelize");

// ── Lazy-load DB to avoid circular require on startup ─────────────────────────
const getDb = () => require("../model");

// ─── GET /api/messages/conversations ─────────────────────────────────────────
// Returns latest message + unread count per contact for the current user
const getConversations = async (req, res) => {
  try {
    const { Message, User } = getDb();
    const userId = req.user.id;

    // Find all unique contacts this user has exchanged messages with
    const sent = await Message.findAll({
      where: { senderId: userId, deletedBySender: false },
      attributes: ["receiverId"],
      group: ["receiverId"],
    });
    const received = await Message.findAll({
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

    // For each contact get latest message + unread count
    const conversations = await Promise.all(
      contactIds.map(async (contactId) => {
        const contact = await User.findByPk(contactId, {
          attributes: ["id", "firstName", "lastName", "role", "email", "lastSeenAt"],
        });
        if (!contact) return null;

        const latest = await Message.findOne({
          where: {
            [Op.or]: [
              { senderId: userId,    receiverId: contactId, deletedBySender: false   },
              { senderId: contactId, receiverId: userId,    deletedByReceiver: false },
            ],
          },
          order: [["createdAt", "DESC"]],
        });

        const unread = await Message.count({
          where: { senderId: contactId, receiverId: userId, isRead: false },
        });

        return {
          contact,
          lastMessage: latest,
          unreadCount: unread,
          updatedAt:   latest?.createdAt,
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

// ─── GET /api/messages/:contactId ────────────────────────────────────────────
// Full message thread between current user and a contact
const getThread = async (req, res) => {
  try {
    const { Message } = getDb();
    const userId    = req.user.id;
    const contactId = req.params.contactId;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId,    receiverId: contactId, deletedBySender: false   },
          { senderId: contactId, receiverId: userId,    deletedByReceiver: false },
        ],
      },
      order:  [["createdAt", "ASC"]],
      limit:  Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    });

    // Mark all received messages as read
    await Message.update(
      { isRead: true, readAt: new Date() },
      { where: { senderId: contactId, receiverId: userId, isRead: false } }
    );

    return res.json({ success: true, data: messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/messages ───────────────────────────────────────────────────────
// Send a message to another user
const send = async (req, res) => {
  try {
    const { Message, User } = getDb();
    const senderId = req.user.id;
    const { receiverId, text, type = "text", referenceId, referenceType } = req.body;

    if (!receiverId || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "receiverId and text are required.",
      });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Recipient not found." });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text: text.trim(),
      type,
      referenceId:   referenceId   || null,
      referenceType: referenceType || null,
    });

    // Notify receiver
    const sender = await User.findByPk(senderId, {
      attributes: ["firstName", "lastName"],
    });

    await notificationService.send({
      userId:        receiverId,
      type:          "message_received",
      title:         `New message from ${sender.firstName} ${sender.lastName}`,
      message:       text.length > 80 ? text.substring(0, 80) + "..." : text,
      referenceId:   senderId,
      referenceType: "User",
    }).catch(() => {}); // don't block on notification failure

    return res.status(201).json({ success: true, data: message });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/messages/:id ─────────────────────────────────────────────────
// Soft-delete a message for the current user only
const remove = async (req, res) => {
  try {
    const { Message } = getDb();
    const userId  = req.user.id;

    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    if (message.senderId === userId) {
      await message.update({ deletedBySender: true });
    } else if (message.receiverId === userId) {
      await message.update({ deletedByReceiver: true });
    } else {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    return res.json({ success: true, message: "Message deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/messages/contacts/available ────────────────────────────────────
// Returns who this user is allowed to message:
//   Tenant   → landlords from their lease applications + all admins
//   Landlord → tenants who applied to their properties + all admins
//   Admin    → everyone
const getAvailableContacts = async (req, res) => {
  try {
    const { User, LeaseApplication } = getDb();
    const { role, id: userId } = req.user;
    let contacts = [];

    if (role === "landlord") {
      // Landlord sees tenants who applied to their properties
      const apps = await LeaseApplication.findAll({
        where: { landlordId: userId },
        include: [{
          model: User,
          as:    "tenant",
          attributes: ["id", "firstName", "lastName", "email", "role", "lastSeenAt"],
        }],
      });
      // Deduplicate by tenant id
      const map = new Map();
      apps.forEach(a => { if (a.tenant) map.set(a.tenant.id, a.tenant); });
      contacts = [...map.values()];

    } else if (role === "tenant") {
      // Tenant sees landlords of properties they applied for
      const apps = await LeaseApplication.findAll({
        where: { tenantId: userId },
        include: [{
          model: User,
          as:    "landlord",
          attributes: ["id", "firstName", "lastName", "email", "role", "lastSeenAt"],
        }],
      });
      const map = new Map();
      apps.forEach(a => { if (a.landlord) map.set(a.landlord.id, a.landlord); });
      contacts = [...map.values()];

    } else {
      // Admin sees all other users
      contacts = await User.findAll({
        where:      { id: { [Op.ne]: userId } },
        attributes: ["id", "firstName", "lastName", "email", "role", "lastSeenAt"],
        limit:      200,
        order:      [["firstName", "ASC"]],
      });
    }

    // Always append admins to tenant/landlord contact lists
    if (role !== "admin") {
      const admins = await User.findAll({
        where:      { role: "admin" },
        attributes: ["id", "firstName", "lastName", "email", "role", "lastSeenAt"],
      });
      const existing = new Set(contacts.map(c => c.id));
      admins.forEach(a => { if (!existing.has(a.id)) contacts.push(a); });
    }

    return res.json({ success: true, data: contacts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getConversations,
  getThread,
  send,
  remove,
  getAvailableContacts,
};