// models/tenantProfile.js  — add trustScore + new fields
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TenantProfile = sequelize.define("TenantProfile", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  userId: {
    type: DataTypes.UUID, allowNull: false, unique: true,
    references: { model: "users", key: "id" },
  },

  // ── Trust Score (denormalized from TrustScoreLog for fast reads) ──
  trustScore:    { type: DataTypes.INTEGER, defaultValue: 100 },

  // ── Identity ──
  idVerified:    { type: DataTypes.BOOLEAN, defaultValue: false },
  idType:        { type: DataTypes.ENUM("national_id","passport","driving_license"), allowNull: true },
  idNumber:      { type: DataTypes.STRING, allowNull: true },

  // ── Rental stats (updated by payment/dispute hooks) ──
  totalPayments: { type: DataTypes.INTEGER, defaultValue: 0 },
  latePayments:  { type: DataTypes.INTEGER, defaultValue: 0 },
  activeLeaseId: { type: DataTypes.UUID,    allowNull: true },

  // ── Profile ──
  bio:           { type: DataTypes.TEXT,    allowNull: true },
  occupation:    { type: DataTypes.STRING,  allowNull: true },
  monthlyIncome: { type: DataTypes.DECIMAL(12,2), allowNull: true },

  // ── Notification preferences ──
  notifyEmail:   { type: DataTypes.BOOLEAN, defaultValue: true },
  notifySMS:     { type: DataTypes.BOOLEAN, defaultValue: true },
  notifyApp:     { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: "tenant_profiles",
  timestamps: true,
});

module.exports = TenantProfile;