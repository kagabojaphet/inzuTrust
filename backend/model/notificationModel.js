// model/notificationModel.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Notification = sequelize.define(
  "Notification",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    userId: { type: DataTypes.INTEGER, allowNull: false }, // receiver

    type: {
      type: DataTypes.ENUM(
        "BOOKING_REQUESTED",
        "BOOKING_APPROVED",
        "BOOKING_REJECTED",
        "BOOKING_CANCELLED",
        "BOOKING_COMPLETED",
        "NEWS_COMMENT",
        "NEWS_REACTION"
      ),
      allowNull: false,
    },

    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },

    // Helps frontend navigate (deep link)
    data: { type: DataTypes.JSON, allowNull: true },

    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "notifications",
    indexes: [{ fields: ["userId", "isRead", "createdAt"] }],
  }
);

module.exports = Notification;