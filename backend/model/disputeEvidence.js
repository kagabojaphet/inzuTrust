// models/disputeEvidenceModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DisputeEvidence = sequelize.define("DisputeEvidence", {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  disputeId:  { type: DataTypes.UUID, allowNull: false, references: { model: "disputes", key: "id" } },
  uploadedBy: { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
  fileName:   { type: DataTypes.STRING, allowNull: false },
  fileUrl:    { type: DataTypes.STRING, allowNull: false },
  fileSize:   { type: DataTypes.STRING, allowNull: true },
  fileType:   { type: DataTypes.ENUM("image", "pdf", "document", "video", "other"), defaultValue: "document" },
}, {
  tableName: "dispute_evidence",
  timestamps: true,
});

module.exports = DisputeEvidence;