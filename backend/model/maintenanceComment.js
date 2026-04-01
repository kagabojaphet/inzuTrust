// model/maintenanceComment.js
// Comments/updates on a maintenance request — by tenant, landlord, or agent
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const MaintenanceComment = sequelize.define("MaintenanceComment", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },

  requestId: { type: DataTypes.UUID, allowNull: false },
  authorId:  { type: DataTypes.UUID, allowNull: false },

  text: {
    type:      DataTypes.TEXT,
    allowNull: false,
  },

  // Optional attachments (photos of progress etc.)
  attachments: {
    type:      DataTypes.JSON,
    allowNull: true,
  },

  // System-generated status-change events
  isSystemNote: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
  },

}, {
  tableName:  "maintenance_comments",
  timestamps: true,
  updatedAt:  false,
  indexes:    [],
});

module.exports = MaintenanceComment;