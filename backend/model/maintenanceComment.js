// model/maintenanceComment.js
// FK columns use DataTypes.UUID with NO references blocks.
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const MaintenanceComment = sequelize.define("MaintenanceComment", {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  requestId: { type: DataTypes.UUID, allowNull: false },
  authorId:  { type: DataTypes.UUID, allowNull: true  }, // null = system note
  text:      { type: DataTypes.TEXT, allowNull: false },
  attachments:  { type: DataTypes.JSON,    allowNull: true },
  isSystemNote: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName:  "maintenance_comments",
  timestamps: true,
  updatedAt:  false,
  indexes:    [],
});

module.exports = MaintenanceComment;