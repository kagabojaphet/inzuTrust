// model/trustScoreLog.js  (or trustScoreLogModel.js — match your filename)
// Immutable append-only log — current score = 100 + SUM(all deltas), capped 0–100
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const TrustScoreLog = sequelize.define("TrustScoreLog", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },

  tenantId: {
    type:       DataTypes.UUID,
    allowNull:  false,
    references: { model: "users", key: "id" },
  },

  // Signed integer — positive = boost, negative = deduction
  delta: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },

  reason: {
    type: DataTypes.ENUM(
      // ── Positive events ────────────────────────────────
      "account_created",      //  0  — sets baseline (no delta)
      "on_time_payment",      // +2  — rent paid on or before due date
      "id_verified",          // +10 — KYC / national ID approved by admin
      "lease_signed",         // +5  — tenant signed a lease agreement
      "lease_completed",      // +5  — lease ended with no issues
      "streak_3_months",      // +3  — 3 consecutive on-time payments
      "streak_6_months",      // +8  — 6 consecutive on-time payments
      "streak_12_months",     // +15 — 12 consecutive on-time payments
      "dispute_won",          // +5  — dispute resolved in tenant's favor
      "guarantor_added",      // +3  — verified guarantor added to profile

      // ── Negative events ────────────────────────────────
      "late_payment",         // -5  — rent paid after due date
      "missed_payment",       // -10 — rent not paid at all for a cycle
      "dispute_filed_against",// -5  — a dispute was filed against this tenant
      "dispute_lost",         // -15 — dispute resolved against tenant
      "report_filed",         // -10 — tenant filed a report that was rejected
      "lease_broken",         // -20 — tenant broke lease early without notice
      "id_rejected"           // -5  — KYC submission rejected
    ),
    allowNull: false,
  },

  // Optional FK to the entity that triggered this event
  referenceId:   { type: DataTypes.UUID,    allowNull: true },
  referenceType: { type: DataTypes.STRING,  allowNull: true }, // "Payment" | "Dispute" | "Agreement"

  // Score value AFTER applying this delta — enables fast history charts
  snapshotAfter: { type: DataTypes.INTEGER, allowNull: false },

  // Human-readable note for admin display
  note: { type: DataTypes.STRING, allowNull: true },

}, {
  tableName:  "trust_score_logs",
  timestamps: true,
  updatedAt:  false, // immutable — no updates ever
});

module.exports = TrustScoreLog;