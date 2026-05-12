// model/landlordProfile.js
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const LandlordProfile = sequelize.define("LandlordProfile", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,              // ← single primary key
  },

  userId: {
    type:      DataTypes.UUID,
    allowNull: false,
    unique:    true,                 // one profile per landlord
    references: { model: "users", key: "id" },
    onDelete:  "CASCADE",
  },

  // ── Business info ──────────────────────────────────────────────────────────
  companyName:     { type: DataTypes.STRING, allowNull: true },
  tinNumber:       { type: DataTypes.STRING, allowNull: true },
  businessAddress: { type: DataTypes.STRING, allowNull: true },
  website:         { type: DataTypes.STRING, allowNull: true },
  bio:             { type: DataTypes.TEXT,   allowNull: true },

  // ── KYC documents ─────────────────────────────────────────────────────────
  idVerified:          { type: DataTypes.BOOLEAN, defaultValue: false },
  idDocumentUrl:       { type: DataTypes.STRING,  allowNull: true },
  proofOfOwnershipUrl: { type: DataTypes.STRING,  allowNull: true },

  // ── Stats (updated by hooks) ───────────────────────────────────────────────
  totalProperties:  { type: DataTypes.INTEGER, defaultValue: 0 },
  activeListings:   { type: DataTypes.INTEGER, defaultValue: 0 },
  totalTenants:     { type: DataTypes.INTEGER, defaultValue: 0 },
  disputesReceived: { type: DataTypes.INTEGER, defaultValue: 0 },
  disputesResolved: { type: DataTypes.INTEGER, defaultValue: 0 },

  // ── Listing Agreement tracking ─────────────────────────────────────────────
  agreedToTerms:   { type: DataTypes.BOOLEAN, defaultValue: false },
  agreedToTermsAt: { type: DataTypes.DATE,    allowNull: true     },

  // ── Badges ────────────────────────────────────────────────────────────────
  badges: { type: DataTypes.JSON, defaultValue: [] },

  // ── Notification preferences ───────────────────────────────────────────────
  notifyEmail: { type: DataTypes.BOOLEAN, defaultValue: true },
  notifySMS:   { type: DataTypes.BOOLEAN, defaultValue: true },
  notifyApp:   { type: DataTypes.BOOLEAN, defaultValue: true },

}, {
  tableName:  "landlord_profiles",
  timestamps: true,
});

module.exports = LandlordProfile;