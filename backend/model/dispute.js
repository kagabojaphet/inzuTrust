// models/disputeModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Dispute = sequelize.define("Dispute", {
  id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  docId:  { type: DataTypes.STRING, allowNull: false, unique: true }, // DIS-2024-001

  reporterId:  { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
  respondentId:{ type: DataTypes.UUID, allowNull: true,  references: { model: "users", key: "id" } },
  propertyId:  { type: DataTypes.UUID, allowNull: true,  references: { model: "properties", key: "id" } },
  agreementId: { type: DataTypes.UUID, allowNull: true,  references: { model: "agreements", key: "id" } },
  assignedTo:  { type: DataTypes.UUID, allowNull: true,  references: { model: "users", key: "id" } }, // admin mediator

  title:       { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT,   allowNull: false },
  category: {
    type: DataTypes.ENUM("property_damage","maintenance","lease_terms","payment","noise","fraud","other"),
    defaultValue: "other",
  },
  claimAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },

  // 4-stage flow: 0=filed, 1=evidence_review, 2=mediation, 3=resolution
  stage: { type: DataTypes.INTEGER, defaultValue: 0 },

  status: {
    type: DataTypes.ENUM("open", "under_review", "mediation", "resolved", "closed"),
    defaultValue: "open",
  },
  resolution: { type: DataTypes.TEXT, allowNull: true },
  resolvedAt: { type: DataTypes.DATE, allowNull: true },
  resolvedBy: { type: DataTypes.UUID, allowNull: true },

  deadline: { type: DataTypes.DATEONLY, allowNull: true },
}, {
  tableName: "disputes",
  timestamps: true,
});

module.exports = Dispute;