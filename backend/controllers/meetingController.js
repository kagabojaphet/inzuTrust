// controllers/meetingController.js
const notificationService = require("../services/notificationService");
const { Op } = require("sequelize");

const getDb = () => require("../model");

const DURATION = {
  virtual_intro: 15,
  phone_call:    10,
  in_person:     30,
};

const TYPE_LABELS = {
  virtual_intro: "Virtual Intro Call (15m)",
  phone_call:    "Phone Call (10m)",
  in_person:     "In-person Viewing (30m)",
};

const create = async (req, res) => {
  try {
    const { Meeting, User, Message } = getDb();
    const { participantId, title, meetingType = "virtual_intro", scheduledAt, location, notes } = req.body;

    if (!participantId || !scheduledAt) {
      return res.status(400).json({ success: false, message: "Participant and Date are required." });
    }

    const participant = await User.findByPk(participantId);
    if (!participant) return res.status(404).json({ success: false, message: "User not found." });

    const organizer = req.user;
    const roomName = meetingType !== "in_person" 
      ? `inzutrust-${[organizer.id, participantId].sort().join("").replace(/[^a-zA-Z0-9]/g, "").slice(0, 30)}` 
      : null;

    const meeting = await Meeting.create({
      organizerId: organizer.id,
      participantId,
      title: title || `${TYPE_LABELS[meetingType]} with ${organizer.firstName}`,
      meetingType,
      scheduledAt: new Date(scheduledAt),
      durationMinutes: DURATION[meetingType] || 15,
      status: "pending",
      roomName,
      location,
      notes,
    });

    // Notify via Chat Message
    const dateStr = new Date(scheduledAt).toLocaleDateString("en-RW", { weekday: 'short', day: 'numeric', month: 'short' });
    const timeStr = new Date(scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    await Message.create({
      senderId: organizer.id,
      receiverId: participantId,
      text: `📅 New Meeting Scheduled\nType: ${TYPE_LABELS[meetingType]}\nDate: ${dateStr} at ${timeStr}\n${notes ? `Notes: ${notes}` : ""}`,
      type: "text",
      referenceId: meeting.id,
      referenceType: "Meeting",
    });

    await notificationService.send({
      userId: participantId,
      type: "meeting_scheduled",
      title: "New Meeting Invitation",
      message: `${organizer.firstName} scheduled a ${TYPE_LABELS[meetingType]} with you.`,
      referenceId: meeting.id,
      referenceType: "Meeting"
    }).catch(() => {});

    return res.status(201).json({ success: true, data: meeting });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMyMeetings = async (req, res) => {
  try {
    const { Meeting, User } = getDb();
    const userId = req.user.id;
    const meetings = await Meeting.findAll({
      where: {
        [Op.or]: [{ organizerId: userId }, { participantId: userId }],
        status: { [Op.ne]: "cancelled" }
      },
      include: [
        { model: User, as: "organizer", attributes: ["id", "firstName", "lastName"] },
        { model: User, as: "participant", attributes: ["id", "firstName", "lastName"] }
      ],
      order: [["scheduledAt", "ASC"]]
    });
    return res.json({ success: true, data: meetings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const confirm = async (req, res) => {
  try {
    const { Meeting } = getDb();
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, message: "Not found." });
    if (meeting.participantId !== req.user.id) return res.status(403).json({ success: false, message: "Unauthorized." });

    await meeting.update({ status: "confirmed" });

    notificationService.send({
      userId: meeting.organizerId,
      type: "meeting_confirmed",
      title: "Meeting Confirmed ✅",
      message: `${req.user.firstName} confirmed your meeting: ${meeting.title}`,
      referenceId: meeting.id,
      referenceType: "Meeting"
    }).catch(() => {});

    return res.json({ success: true, data: meeting });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const cancel = async (req, res) => {
  try {
    const { Meeting } = getDb();
    const { reason } = req.body;
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, message: "Not found." });

    if (meeting.organizerId !== req.user.id && meeting.participantId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    await meeting.update({ status: "cancelled", cancelReason: reason });

    const otherId = meeting.organizerId === req.user.id ? meeting.participantId : meeting.organizerId;
    notificationService.send({
      userId: otherId,
      type: "meeting_cancelled",
      title: "Meeting Cancelled ❌",
      message: `${req.user.firstName} cancelled: ${meeting.title}`,
      referenceId: meeting.id,
      referenceType: "Meeting"
    }).catch(() => {});

    return res.json({ success: true, message: "Cancelled." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { create, getMyMeetings, confirm, cancel };