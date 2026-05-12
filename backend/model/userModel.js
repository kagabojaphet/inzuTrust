// model/userModel.js
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },

  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName:  { type: DataTypes.STRING, allowNull: false },

  email: {
    type:     DataTypes.STRING,
    allowNull: false,
    unique:   true,
    validate: { isEmail: true },
  },

  password: { type: DataTypes.STRING, allowNull: true },
  phone:    { type: DataTypes.STRING, allowNull: true },

  // ── Optional at registration ───────────────────────────────────────────────
  profilePicture: { type: DataTypes.STRING, allowNull: true },

  // National ID — optional, used for KYC across all roles
  nationalId: { type: DataTypes.STRING, allowNull: true },

  // Landlord-specific government ID (optional at registration)
  landlordId: { type: DataTypes.STRING, allowNull: true },

  authType: { type: DataTypes.STRING, defaultValue: "email" },

  role: {
    type:         DataTypes.ENUM("tenant", "landlord", "agent", "admin"),
    defaultValue: "tenant",
  },

  // ── Verification flags ─────────────────────────────────────────────────────
  isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isVerified:      { type: DataTypes.BOOLEAN, defaultValue: false }, // Admin/KYC
  isRedFlagged:    { type: DataTypes.BOOLEAN, defaultValue: false },
  isSuspended:     { type: DataTypes.BOOLEAN, defaultValue: false },

  // ── Listing Agreement (shown on image) ────────────────────────────────────
  // Landlord/Agent must accept before publishing any property
  hasAcceptedListingAgreement: { type: DataTypes.BOOLEAN, defaultValue: false },
  listingAgreementAcceptedAt:  { type: DataTypes.DATE,    allowNull: true     },

  // ── Badge system ──────────────────────────────────────────────────────────
  // JSON array of earned badge keys e.g. ["verified_landlord", "top_agent"]
  badges: {
    type:         DataTypes.JSON,
    defaultValue: [],
  },

  // Profile completion percentage (0-100), computed and cached
  profileCompletion: {
    type:         DataTypes.INTEGER,
    defaultValue: 0,
  },

  // ── OTP ───────────────────────────────────────────────────────────────────
  otp:       { type: DataTypes.STRING, allowNull: true },
  otpExpiry: { type: DataTypes.DATE,   allowNull: true },

  lastSeenAt: {
    type:         DataTypes.DATE,
    allowNull:    true,
    defaultValue: null,
  },
}, {
  tableName:  "users",
  timestamps: true,
});

module.exports = User;