// models/disputeMessageModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DisputeMessage = sequelize.define("DisputeMessage", {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  disputeId: { type: DataTypes.UUID, allowNull: false, references: { model: "disputes", key: "id" } },
  senderId:  { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
  text:      { type: DataTypes.TEXT, allowNull: false },
  isSystem:  { type: DataTypes.BOOLEAN, defaultValue: false }, // system notices
}, {
  tableName: "dispute_messages",
  timestamps: true,
});

module.exports = DisputeMessage;