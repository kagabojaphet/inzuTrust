// model/userModel.js
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  firstName: { type: DataTypes.STRING,  allowNull: false },
  lastName:  { type: DataTypes.STRING,  allowNull: false },
  email: {
    type:     DataTypes.STRING,
    allowNull: false,
    unique:   true,
    validate: { isEmail: true },
  },
  password:  { type: DataTypes.STRING,  allowNull: true },   // null = Google Auth
  phone:     { type: DataTypes.STRING,  allowNull: true },
  authType:  { type: DataTypes.STRING,  defaultValue: "email" }, // 'email' | 'google'
  role: {
    type:         DataTypes.ENUM("tenant", "landlord", "admin"),
    defaultValue: "tenant",
  },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  otp:        { type: DataTypes.STRING,  allowNull: true },
  otpExpiry:  { type: DataTypes.DATE,    allowNull: true },

  // ── Online presence ────────────────────────────────────────────────────────
  // Updated on every authenticated API request via authMiddleware
  // Frontend checks: lastSeenAt within last 3 minutes → green dot
  lastSeenAt: {
    type:         DataTypes.DATE,
    allowNull:    true,
    defaultValue: null,
  },

  // ── Admin controls ─────────────────────────────────────────────────────────
  // Suspended users cannot log in or access protected routes
  isSuspended: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName:  "users",
  timestamps: true,
});

module.exports = User;