// controllers/meetingController.js
const notificationService = require("../services/notificationService");
const { Op } = require("sequelize");

const getDb = () => require("../model");

// ── Duration map ──────────────────────────────────────────────────────────────
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

// ── POST /api/meetings ────────────────────────────────────────────────────────
// Organizer schedules a meeting with a participant
const create = async (req, res) => {
  try {
    const { Meeting, User, Message } = getDb();
    const {
      participantId, title, meetingType = "virtual_intro",
      scheduledAt, location, notes,
    } = req.body;

    if (!participantId || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "participantId and scheduledAt are required.",
      });
    }

    const participant = await User.findByPk(participantId, {
      attributes: ["id", "firstName", "lastName", "email"],
    });
    if (!participant) {
      return res.status(404).json({ success: false, message: "Participant not found." });
    }

    const organizer = req.user;
    const date      = new Date(scheduledAt);

    // Generate Jitsi room name for virtual calls
    const roomName = meetingType !== "in_person"
      ? `inzutrust-${[organizer.id, participantId].sort().join("").replace(/[^a-zA-Z0-9]/g, "").slice(0, 40)}`
      : null;

    const meeting = await Meeting.create({
      organizerId:     organizer.id,
      participantId,
      title:           title || `${TYPE_LABELS[meetingType]} with ${organizer.firstName}`,
      meetingType,
      scheduledAt:     date,
      durationMinutes: DURATION[meetingType] || 15,
      status:          "pending",
      roomName,
      location:        location || null,
      notes:           notes    || null,
    });

    // ── Send a message in the chat to notify the participant ─────────────────
    const dateStr = date.toLocaleDateString("en-RW", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const msgText = [
      `📅 Meeting Scheduled: ${TYPE_LABELS[meetingType]}`,
      `📆 ${dateStr} at ${timeStr}`,
      meetingType !== "in_person" && roomName
        ? `🔗 Join link will be available at call time`
        : `📍 Location: ${location || "TBD"}`,
      notes ? `📝 Notes: ${notes}` : null,
      `\nMeeting ID: ${meeting.id.slice(0, 8).toUpperCase()}`,
    ].filter(Boolean).join("\n");

    await Message.create({
      senderId:      organizer.id,
      receiverId:    participantId,
      text:          msgText,
      type:          "text",
      referenceId:   meeting.id,
      referenceType: "Meeting",
    });

    // ── Notification ─────────────────────────────────────────────────────────
    await notificationService.send({
      userId:        participantId,
      type:          "meeting_scheduled",
      title:         `New Meeting: ${TYPE_LABELS[meetingType]}`,
      message:       `${organizer.firstName} ${organizer.lastName} scheduled a ${TYPE_LABELS[meetingType]} with you on ${dateStr} at ${timeStr}.`,
      referenceId:   meeting.id,
      referenceType: "Meeting",
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Meeting scheduled successfully.",
      data:    meeting,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/meetings ─────────────────────────────────────────────────────────
// Get all meetings for the current user (as organizer OR participant)
const getMyMeetings = async (req, res) => {
  try {
    const { Meeting, User } = getDb();
    const userId = req.user.id;

    const meetings = await Meeting.findAll({
      where: {
        [Op.or]: [
          { organizerId:   userId },
          { participantId: userId },
        ],
        status: { [Op.ne]: "cancelled" },
      },
      include: [
        { model: User, as: "organizer",   attributes: ["id", "firstName", "lastName", "role"] },
        { model: User, as: "participant", attributes: ["id", "firstName", "lastName", "role"] },
      ],
      order: [["scheduledAt", "ASC"]],
    });

    return res.json({ success: true, data: meetings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/meetings/:id/confirm ─────────────────────────────────────────────
const confirm = async (req, res) => {
  try {
    const { Meeting, User } = getDb();
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found." });
    if (meeting.participantId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only the participant can confirm." });
    }

    await meeting.update({ status: "confirmed" });

    // Notify organizer
    const participant = req.user;
    await notificationService.send({
      userId:        meeting.organizerId,
      type:          "meeting_confirmed",
      title:         "Meeting Confirmed ✅",
      message:       `${participant.firstName} ${participant.lastName} confirmed your meeting: "${meeting.title}".`,
      referenceId:   meeting.id,
      referenceType: "Meeting",
    }).catch(() => {});

    return res.json({ success: true, message: "Meeting confirmed.", data: meeting });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/meetings/:id/cancel ──────────────────────────────────────────────
const cancel = async (req, res) => {
  try {
    const { Meeting, User } = getDb();
    const { reason } = req.body;
    const userId = req.user.id;

    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found." });

    const isInvolved = meeting.organizerId === userId || meeting.participantId === userId;
    if (!isInvolved) return res.status(403).json({ success: false, message: "Not authorized." });

    await meeting.update({
      status:       "cancelled",
      cancelledBy:  userId,
      cancelReason: reason || null,
    });

    // Notify the other party
    const otherId = meeting.organizerId === userId ? meeting.participantId : meeting.organizerId;
    const canceller = req.user;

    await notificationService.send({
      userId:        otherId,
      type:          "meeting_cancelled",
      title:         "Meeting Cancelled ❌",
      message:       `${canceller.firstName} ${canceller.lastName} cancelled the meeting: "${meeting.title}". ${reason ? `Reason: ${reason}` : ""}`,
      referenceId:   meeting.id,
      referenceType: "Meeting",
    }).catch(() => {});

    return res.json({ success: true, message: "Meeting cancelled.", data: meeting });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { create, getMyMeetings, confirm, cancel };