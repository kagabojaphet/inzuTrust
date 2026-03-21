// model/meetingModel.js
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const Meeting = sequelize.define("Meeting", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },

  organizerId: {
    type:       DataTypes.UUID,
    allowNull:  false,
    references: { model: "users", key: "id" },
  },

  participantId: {
    type:       DataTypes.UUID,
    allowNull:  false,
    references: { model: "users", key: "id" },
  },

  title: {
    type:      DataTypes.STRING,
    allowNull: false,
  },

  meetingType: {
    type: DataTypes.ENUM(
      "virtual_intro",   // Virtual Intro Call (15m)
      "in_person",       // In-person Viewing (30m)
      "phone_call"       // Phone Call (10m)
    ),
    defaultValue: "virtual_intro",
  },

  scheduledAt: {
    type:      DataTypes.DATE,
    allowNull: false,
  },

  durationMinutes: {
    type:         DataTypes.INTEGER,
    defaultValue: 15,
  },

  status: {
    type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
    defaultValue: "pending",
  },

  // For virtual calls — Jitsi room name
  roomName: {
    type:      DataTypes.STRING,
    allowNull: true,
  },

  // Location for in-person meetings
  location: {
    type:      DataTypes.STRING,
    allowNull: true,
  },

  notes: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },

  cancelledBy: {
    type:      DataTypes.UUID,
    allowNull: true,
  },

  cancelReason: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName:  "meetings",
  timestamps: true,
});

module.exports = Meeting;