// models/messageModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// A conversation is identified by a pair (senderId, receiverId) — always sorted
const Message = sequelize.define("Message", {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  senderId:   { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
  receiverId: { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },

  text:       { type: DataTypes.TEXT, allowNull: true },
  type: {
    type: DataTypes.ENUM("text", "proposal", "lease_draft", "payment_request", "system"),
    defaultValue: "text",
  },

  // Optional reference (e.g. a viewing proposal or a payment request)
  referenceId:   { type: DataTypes.UUID,   allowNull: true },
  referenceType: { type: DataTypes.STRING, allowNull: true }, // "viewing" | "payment" | "lease"

  isRead:  { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt:  { type: DataTypes.DATE,    allowNull: true },

  // Soft delete
  deletedBySender:   { type: DataTypes.BOOLEAN, defaultValue: false },
  deletedByReceiver: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: "messages",
  timestamps: true,
});

module.exports = Message;