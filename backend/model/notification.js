// models/notificationModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define("Notification", {
  id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },

  type: {
    type: DataTypes.ENUM(
      "lease_signed", "lease_pending", "lease_application",
      "payment_due", "payment_received", "payment_late",
      "dispute_opened", "dispute_updated", "dispute_resolved",
      "viewing_confirmed", "viewing_cancelled",
      "trust_score_changed", "message_received",
      "kyc_approved", "kyc_rejected", "general"
    ),
    allowNull: false,
  },

  title:   { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT,   allowNull: false },

  referenceId:   { type: DataTypes.UUID,   allowNull: true },
  referenceType: { type: DataTypes.STRING, allowNull: true },

  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt: { type: DataTypes.DATE,    allowNull: true },
}, {
  tableName: "notifications",
  timestamps: true,
  updatedAt: false,
});

module.exports = Notification;