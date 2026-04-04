// model/maintenanceRequest.js
// FK columns use DataTypes.UUID with NO references blocks.
// Relationships + constraints:false handled exclusively in model/index.js.
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const MaintenanceRequest = sequelize.define("MaintenanceRequest", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  // Plain UUID — no references block (that's what causes errno 150)
  propertyId:      { type: DataTypes.UUID, allowNull: false },
  tenantId:        { type: DataTypes.UUID, allowNull: false },
  landlordId:      { type: DataTypes.UUID, allowNull: false },
  assignedAgentId: { type: DataTypes.UUID, allowNull: true  },

  title:       { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT,   allowNull: false },

  category: {
    type: DataTypes.ENUM(
      "plumbing","electrical","structural","appliance",
      "pest_control","cleaning","security","internet","other"
    ),
    defaultValue: "other",
  },

  priority:       { type: DataTypes.ENUM("low","medium","high","emergency"),                              defaultValue: "medium" },
  status:         { type: DataTypes.ENUM("open","acknowledged","in_progress","resolved","rejected","cancelled"), defaultValue: "open" },
  images:         { type: DataTypes.JSON,    allowNull: true },
  resolutionNote: { type: DataTypes.TEXT,    allowNull: true },
  scheduledAt:    { type: DataTypes.DATE,    allowNull: true },
  resolvedAt:     { type: DataTypes.DATE,    allowNull: true },
  tenantRating:   { type: DataTypes.INTEGER, allowNull: true },
  tenantFeedback: { type: DataTypes.TEXT,    allowNull: true },

}, {
  tableName:  "maintenance_requests",
  timestamps: true,
  indexes:    [],
});

module.exports = MaintenanceRequest;