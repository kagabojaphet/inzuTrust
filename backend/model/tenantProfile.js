// model/tenantProfile.js
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const TenantProfile = sequelize.define("TenantProfile", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,              // ← single primary key
  },

  userId: {
    type:      DataTypes.UUID,
    allowNull: false,
    unique:    true,
    references: { model: "users", key: "id" },
  },

  // ── Identity / KYC ────────────────────────────────────────────────────────
  idVerified:    { type: DataTypes.BOOLEAN, defaultValue: false },
  idType: {
    type:      DataTypes.ENUM("national_id", "passport", "driving_license"),
    allowNull: true,
  },
  idNumber:      { type: DataTypes.STRING, allowNull: true },
  idDocumentUrl: { type: DataTypes.STRING, allowNull: true },

  // ── Profile info ──────────────────────────────────────────────────────────
  bio:            { type: DataTypes.TEXT,          allowNull: true },
  occupation:     { type: DataTypes.STRING,         allowNull: true },
  monthlyIncome:  { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  currentAddress: { type: DataTypes.STRING,         allowNull: true },
  momoNumber:     { type: DataTypes.STRING,         allowNull: true },

  // ── Trust Score ───────────────────────────────────────────────────────────
  trustScore: { type: DataTypes.INTEGER, defaultValue: 100 },

  // ── Rental stats ──────────────────────────────────────────────────────────
  totalPayments:  { type: DataTypes.INTEGER, defaultValue: 0 },
  latePayments:   { type: DataTypes.INTEGER, defaultValue: 0 },
  onTimePayments: { type: DataTypes.INTEGER, defaultValue: 0 },
  activeLeaseId:  { type: DataTypes.UUID,    allowNull: true },

  // ── Badges ────────────────────────────────────────────────────────────────
  badges: { type: DataTypes.JSON, defaultValue: [] },

  // ── Notification preferences ──────────────────────────────────────────────
  notifyEmail: { type: DataTypes.BOOLEAN, defaultValue: true },
  notifySMS:   { type: DataTypes.BOOLEAN, defaultValue: true },
  notifyApp:   { type: DataTypes.BOOLEAN, defaultValue: true },

}, {
  tableName:  "tenant_profiles",
  timestamps: true,
});

module.exports = TenantProfile;