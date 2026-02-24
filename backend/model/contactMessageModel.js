// model/contactMessageModel.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ContactMessage = sequelize.define(
  "ContactMessage",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },

    subject: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },

    status: {
      type: DataTypes.ENUM("NEW", "IN_PROGRESS", "RESOLVED"),
      allowNull: false,
      defaultValue: "NEW",
    },
  },
  { tableName: "contact_messages" }
);

module.exports = ContactMessage;