// controllers/messageController.js
// Contact rules:
//   tenant   → their landlord(s) via agreements + assigned agents + admins
//   landlord → their tenants (agreements) + their agents (AgentProperty) + admins
//   agent    → their assigned landlord(s) + tenants of assigned properties + admins
//   admin    → everyone
const notificationService = require("../services/notificationService");
const { Op } = require("sequelize");

const getDb = () => require("../model");

const USER_ATTRS = ["id","firstName","lastName","email","role","lastSeenAt"];

// ── Dedup helper ──────────────────────────────────────────────────────────────
const dedup = (arr) => {
  const seen = new Map();
  arr.forEach(u => {
    const id = u?.id || u?.dataValues?.id;
    if (id) seen.set(id, u);
  });
  return [...seen.values()];
};

// ─── GET /api/messages/conversations ─────────────────────────────────────────
const getConversations = async (req, res) => {
  try {
    const { Message, User } = getDb();
    const userId = req.user.id;

    const [sent, received] = await Promise.all([
      Message.findAll({ where: { senderId:   userId, deletedBySender:   false }, attributes: ["receiverId"], group: ["receiverId"] }),
      Message.findAll({ where: { receiverId: userId, deletedByReceiver: false }, attributes: ["senderId"],   group: ["senderId"]   }),
    ]);

    const contactIds = [...new Set([
      ...sent.map(m => m.receiverId),
      ...received.map(m => m.senderId),
    ])].filter(id => id !== userId);

    const conversations = await Promise.all(
      contactIds.map(async (contactId) => {
        const contact = await User.findByPk(contactId, { attributes: USER_ATTRS });
        if (!contact) return null;

        const [latest, unread] = await Promise.all([
          Message.findOne({
            where: {
              [Op.or]: [
                { senderId: userId,    receiverId: contactId, deletedBySender:   false },
                { senderId: contactId, receiverId: userId,    deletedByReceiver: false },
              ],
            },
            order: [["createdAt","DESC"]],
          }),
          Message.count({ where: { senderId: contactId, receiverId: userId, isRead: false } }),
        ]);

        return { contact, lastMessage: latest, unreadCount: unread, updatedAt: latest?.createdAt };
      })
    );

    const result = conversations.filter(Boolean).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return res.json({ success: true, data: result });
  } catch (err) {
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
          { senderId: userId,    receiverId: contactId, deletedBySender:   false },
          { senderId: contactId, receiverId: userId,    deletedByReceiver: false },
        ],
      },
      order:  [["createdAt","ASC"]],
      limit:  Number(limit),
      offset: (page - 1) * Number(limit),
    });

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
const send = async (req, res) => {
  try {
    const { Message, User } = getDb();
    const senderId = req.user.id;
    const { receiverId, text, type = "text", referenceId, referenceType } = req.body;

    if (!receiverId || !text?.trim()) {
      return res.status(400).json({ success: false, message: "receiverId and text are required" });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: "Recipient not found" });

    const message = await Message.create({
      senderId, receiverId, text: text.trim(), type,
      referenceId: referenceId || null, referenceType: referenceType || null,
    });

    await notificationService.send({
      userId:        receiverId,
      type:          "message_received",
      title:         `New message from ${req.user.firstName}`,
      message:       text.length > 80 ? text.slice(0, 80) + "..." : text,
      referenceId:   senderId,
      referenceType: "User",
    }).catch(() => {});

    return res.status(201).json({ success: true, data: message });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/messages/:id ─────────────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const { Message } = getDb();
    const userId  = req.user.id;
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    if      (message.senderId   === userId) await message.update({ deletedBySender:   true });
    else if (message.receiverId === userId) await message.update({ deletedByReceiver: true });
    else return res.status(403).json({ success: false, message: "Forbidden" });

    return res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/messages/contacts/available ────────────────────────────────────
// FULL role-based contact discovery:
//   tenant   → landlord(s) via agreements + assigned agent(s) + admins
//   landlord → tenants via agreements + agents they manage + admins
//   agent    → assigned landlord(s) + tenants of assigned properties + admins
//   admin    → everyone
const getAvailableContacts = async (req, res) => {
  try {
    const { User, Agreement, AgentProperty, LeaseApplication } = getDb();
    const { role, id: userId } = req.user;
    let contacts = [];

    if (role === "tenant") {
      // 1. Landlords from signed/active agreements
      const agreements = await Agreement.findAll({
        where:   { tenantId: userId },
        include: [{ model: User, as: "landlord", attributes: USER_ATTRS }],
      });
      const landlords = agreements.filter(a => a.landlord).map(a => a.landlord);

      // 2. Agents assigned to properties the tenant has agreements on
      const propertyIds = [...new Set(agreements.map(a => a.propertyId).filter(Boolean))];
      let agents = [];
      if (propertyIds.length > 0) {
        const assignments = await AgentProperty.findAll({
          where:   { propertyId: { [Op.in]: propertyIds }, isActive: true },
          include: [{ model: User, as: "agent", attributes: USER_ATTRS }],
        });
        agents = assignments.filter(a => a.agent).map(a => a.agent);
      }

      contacts = dedup([...landlords, ...agents]);

    } else if (role === "landlord") {
      // 1. Tenants from agreements on this landlord's properties
      const agreements = await Agreement.findAll({
        where:   { landlordId: userId },
        include: [{ model: User, as: "tenant", attributes: USER_ATTRS }],
      });
      const tenants = agreements.filter(a => a.tenant).map(a => a.tenant);

      // 2. Agents assigned to this landlord's properties
      const assignments = await AgentProperty.findAll({
        where:   { assignedById: userId, isActive: true },
        include: [{ model: User, as: "agent", attributes: USER_ATTRS }],
      });
      const agents = assignments.filter(a => a.agent).map(a => a.agent);

      // 3. Also include tenants from lease applications (in case agreement not yet created)
      const apps = await LeaseApplication.findAll({
        where:   { landlordId: userId },
        include: [{ model: User, as: "tenant", attributes: USER_ATTRS }],
      });
      const appTenants = apps.filter(a => a.tenant).map(a => a.tenant);

      contacts = dedup([...tenants, ...agents, ...appTenants]);

    } else if (role === "agent") {
      // 1. Landlords who assigned this agent to their properties
      const assignments = await AgentProperty.findAll({
        where:   { agentId: userId, isActive: true },
        include: [{ model: User, as: "assigner", attributes: USER_ATTRS }],
      });
      const landlords = assignments.filter(a => a.assigner).map(a => a.assigner);

      // 2. Tenants of properties this agent is assigned to
      const propertyIds = [...new Set(assignments.map(a => a.propertyId).filter(Boolean))];
      let tenants = [];
      if (propertyIds.length > 0) {
        const agreements = await Agreement.findAll({
          where:   { propertyId: { [Op.in]: propertyIds } },
          include: [{ model: User, as: "tenant", attributes: USER_ATTRS }],
        });
        tenants = agreements.filter(a => a.tenant).map(a => a.tenant);
      }

      contacts = dedup([...landlords, ...tenants]);

    } else {
      // Admin: everyone except themselves
      contacts = await User.findAll({
        where:      { id: { [Op.ne]: userId } },
        attributes: USER_ATTRS,
        order:      [["role","ASC"],["firstName","ASC"]],
        limit:      200,
      });
    }

    // Always add admins to non-admin contact lists
    if (role !== "admin") {
      const admins = await User.findAll({
        where:      { role: "admin" },
        attributes: USER_ATTRS,
      });
      const existing = new Set(contacts.map(c => c.id || c.dataValues?.id));
      admins.forEach(a => {
        const id = a.id || a.dataValues?.id;
        if (id && !existing.has(id)) contacts.push(a);
      });
    }

    // Filter out self (safety net)
    contacts = contacts.filter(c => (c.id || c.dataValues?.id) !== userId);

    return res.json({ success: true, data: contacts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getConversations, getThread, send, remove, getAvailableContacts };