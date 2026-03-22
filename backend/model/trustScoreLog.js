// models/trustScoreLogModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Immutable log — never update, only append
// Current score = 100 + SUM(delta)
const TrustScoreLog = sequelize.define("TrustScoreLog", {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenantId: { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },

  delta: { type: DataTypes.INTEGER, allowNull: false }, // e.g. +2 or -5

  reason: {
    type: DataTypes.ENUM(
      "on_time_payment",   // +2
      "id_verified",       // +10
      "lease_completed",   // +5
      "streak_6_months",   // +8
      "late_payment",      // -5
      "report_filed",      // -10
      "dispute_lost",      // -15
      "lease_broken",      // -20
      "account_created"    // initial +0 (sets baseline)
    ),
    allowNull: false,
  },

  referenceId:   { type: DataTypes.UUID,   allowNull: true }, // payment/dispute/agreement id
  referenceType: { type: DataTypes.STRING, allowNull: true }, // "Payment" | "Dispute" | "Agreement"
  snapshotAfter: { type: DataTypes.INTEGER, allowNull: false }, // score AFTER this event
  note:          { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: "trust_score_logs",
  timestamps: true,
  updatedAt: false, // immutable
});

module.exports = TrustScoreLog;