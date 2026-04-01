// model/agentProperty.js
// Junction table: which Agent is assigned to which Property, by whom, with what permissions
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const AgentProperty = sequelize.define("AgentProperty", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },

  // The assigned agent
  agentId: {
    type:      DataTypes.UUID,
    allowNull: false,
  },

  // The property they manage
  propertyId: {
    type:      DataTypes.UUID,
    allowNull: false,
  },

  // Who created this assignment (landlord or admin)
  assignedById: {
    type:      DataTypes.UUID,
    allowNull: false,
  },

  // ── Granular permissions ───────────────────────────────────────────────────
  // Agent can update property details (title, description, images, etc.)
  canEditDetails: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },

  // Agent can review/accept/reject tenant applications for this property
  canManageTenants: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },

  // Agent can view payments for this property (read-only)
  canViewPayments: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // Agent can create/respond to maintenance requests
  canHandleMaintenance: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },

  // Optional: assignment expiry date (null = no expiry)
  expiresAt: {
    type:      DataTypes.DATE,
    allowNull: true,
  },

  // Whether the assignment is currently active
  isActive: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },

}, {
  tableName:  "agent_properties",
  timestamps: true,
  indexes:    [], // prevent extra auto-indexes
});

module.exports = AgentProperty;