// model/userModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // null for Google Auth users
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    authType: {
      type: DataTypes.STRING,
      defaultValue: "email", // 'email' or 'google'
    },
    role: {
      type: DataTypes.ENUM("tenant", "landlord", "admin"),
      defaultValue: "tenant",
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // ── Online presence ───────────────────────────────────────────────────────
    // Updated on every authenticated API request via authMiddleware.
    // Frontend checks: lastSeenAt within the last 3 minutes → show green dot.
    lastSeenAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

module.exports = User;