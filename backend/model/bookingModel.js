// model/bookingModel.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Booking = sequelize.define(
  "Booking",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    propertyId: { type: DataTypes.INTEGER, allowNull: false },

    tenantId: { type: DataTypes.INTEGER, allowNull: false },
    landlordId: { type: DataTypes.INTEGER, allowNull: false },

    type: {
      type: DataTypes.ENUM("VISIT", "CALL", "MEET"),
      allowNull: false,
      defaultValue: "VISIT",
    },

    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    // scheduling
    startTime: { type: DataTypes.DATE, allowNull: false },
    endTime: { type: DataTypes.DATE, allowNull: true },

    // optional details
    note: { type: DataTypes.TEXT, allowNull: true },
    contactPhone: { type: DataTypes.STRING, allowNull: true },
    meetingLocation: { type: DataTypes.STRING, allowNull: true }, // for MEET/VISIT
  },
  { tableName: "bookings" }
);

module.exports = Booking;