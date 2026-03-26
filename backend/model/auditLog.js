// model/auditLog.js
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const AuditLog = sequelize.define("AuditLog", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },

  // Stored as STRING(36) not UUID with references — avoids extra FK index
  actorId:   { type: DataTypes.STRING(36), allowNull: true  },
  actorName: { type: DataTypes.STRING,     allowNull: true  },
  actorRole: { type: DataTypes.STRING,     allowNull: true  },

  action:   { type: DataTypes.STRING, allowNull: false },
  target:   { type: DataTypes.STRING, allowNull: true  },

  severity: {
    type:         DataTypes.ENUM("INFO", "SUCCESS", "WARNING", "ERROR", "CRITICAL"),
    defaultValue: "INFO",
  },

  sourceIp:  { type: DataTypes.STRING, allowNull: true },
  userAgent: { type: DataTypes.STRING, allowNull: true },
  metadata:  { type: DataTypes.JSON,   allowNull: true },

}, {
  tableName:  "audit_logs",
  timestamps: true,
  updatedAt:  false,
  indexes:    [], // prevent auto-index generation
});

module.exports = AuditLog;