// model/agentProperty.js
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const AgentProperty = sequelize.define("AgentProperty", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },

  agentId:      { type: DataTypes.UUID, allowNull: false },
  propertyId:   { type: DataTypes.UUID, allowNull: false },
  assignedById: { type: DataTypes.UUID, allowNull: false },

  // ── Granular permissions ──────────────────────────────────────────────────
  canEditDetails:        { type: DataTypes.BOOLEAN, defaultValue: true  },
  canManageTenants:      { type: DataTypes.BOOLEAN, defaultValue: true  },
  canViewPayments:       { type: DataTypes.BOOLEAN, defaultValue: false },
  canHandleMaintenance:  { type: DataTypes.BOOLEAN, defaultValue: true  },
  canCreateProperty:     { type: DataTypes.BOOLEAN, defaultValue: false }, // NEW: agent can list new properties (notifies landlord)
  canViewTenants:        { type: DataTypes.BOOLEAN, defaultValue: true  }, // NEW: see tenant profiles for this property
  canRespondDisputes:    { type: DataTypes.BOOLEAN, defaultValue: false }, // NEW: respond to disputes on behalf of landlord

  expiresAt: { type: DataTypes.DATE,    allowNull: true },
  isActive:  { type: DataTypes.BOOLEAN, defaultValue: true },

}, {
  tableName:  "agent_properties",
  timestamps: true,
  indexes:    [],
});

module.exports = AgentProperty;