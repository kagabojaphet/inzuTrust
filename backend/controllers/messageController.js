// controllers/messageController.js
const { Op } = require("sequelize");

const getDb    = () => require("../model");
const getNotif = () => require("../services/notificationService");

// ─── GET /api/messages/conversations ─────────────────────────────────────────
const getConversations = async (req, res) => {
  try {
    const { Message, User } = getDb();
    const userId = req.user.id;

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

        return { contact, lastMessage: latest, unreadCount: unread, updatedAt: latest?.createdAt };
      })
    );

    return res.json({
      success: true,
      data: conversations.filter(Boolean).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    });
  } catch (err) {
    console.error("[getConversations]", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/messages/:contactId ────────────────────────────────────────────
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

    await Message.update(
      { isRead: true, readAt: new Date() },
      { where: { senderId: contactId, receiverId: userId, isRead: false } }
    );

    return res.json({ success: true, data: messages });
  } catch (err) {
    console.error("[getThread]", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/messages ───────────────────────────────────────────────────────
const send = async (req, res) => {
  try {
    const { Message, User } = getDb();
    const senderId = req.user.id;
    const { receiverId, text, type = "text", referenceId, referenceType } = req.body;

    if (!receiverId || !text?.trim()) {
      return res.status(400).json({ success: false, message: "receiverId and text are required." });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: "Recipient not found." });

    const message = await Message.create({
      senderId,
      receiverId,
      text: text.trim(),
      type,
      referenceId:   referenceId   || null,
      referenceType: referenceType || null,
    });

    try {
      const sender = await User.findByPk(senderId, { attributes: ["firstName", "lastName"] });
      await getNotif().send({
        userId:        receiverId,
        type:          "message_received",
        title:         `New message from ${sender.firstName} ${sender.lastName}`,
        message:       text.length > 80 ? text.substring(0, 80) + "..." : text,
        referenceId:   senderId,
        referenceType: "User",
      });
    } catch (_) {}

    return res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error("[send]", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/messages/:id ─────────────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const { Message } = getDb();
    const userId  = req.user.id;
    const message = await Message.findByPk(req.params.id);

    if (!message) return res.status(404).json({ success: false, message: "Message not found." });
    if      (message.senderId   === userId) await message.update({ deletedBySender: true });
    else if (message.receiverId === userId) await message.update({ deletedByReceiver: true });
    else return res.status(403).json({ success: false, message: "Forbidden." });

    return res.json({ success: true, message: "Message deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/messages/contacts/available ────────────────────────────────────
// KEY FIX: Tenants now see ALL landlords + admins (not just ones they applied to)
// Landlords now see ALL tenants + admins (not just ones who applied to them)
// This ensures the "New Chat" modal always has people to message
const getAvailableContacts = async (req, res) => {
  try {
    const { User } = getDb();
    const { role, id: userId } = req.user;
    let contacts = [];

    if (role === "landlord") {
      // Show ALL tenants so landlord can initiate conversations
      contacts = await User.findAll({
        where:      { role: "tenant", id: { [Op.ne]: userId } },
        attributes: ["id", "firstName", "lastName", "email", "role", "lastSeenAt"],
        order:      [["firstName", "ASC"]],
        limit:      200,
      });

    } else if (role === "tenant") {
      // Show ALL landlords so tenant can initiate conversations
      contacts = await User.findAll({
        where:      { role: "landlord", id: { [Op.ne]: userId } },
        attributes: ["id", "firstName", "lastName", "email", "role", "lastSeenAt"],
        order:      [["firstName", "ASC"]],
        limit:      200,
      });

    } else {
      // Admin sees everyone
      contacts = await User.findAll({
        where:      { id: { [Op.ne]: userId } },
        attributes: ["id", "firstName", "lastName", "email", "role", "lastSeenAt"],
        order:      [["firstName", "ASC"]],
        limit:      200,
      });
    }

    // Always append admins to tenant/landlord lists
    if (role !== "admin") {
      const admins = await User.findAll({
        where:      { role: "admin", id: { [Op.ne]: userId } },
        attributes: ["id", "firstName", "lastName", "email", "role", "lastSeenAt"],
      });
      const existing = new Set(contacts.map(c => c.id));
      admins.forEach(a => { if (!existing.has(a.id)) contacts.push(a); });
    }

    console.log(`[getAvailableContacts] role=${role} → ${contacts.length} contacts`);
    return res.json({ success: true, data: contacts });
  } catch (err) {
    console.error("[getAvailableContacts]", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getConversations, getThread, send, remove, getAvailableContacts };