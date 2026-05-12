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

  // ── Granular permissions (used by agentController + authMiddleware) ─────────
  canEditDetails:       { type: DataTypes.BOOLEAN, defaultValue: true  },
  canManageTenants:     { type: DataTypes.BOOLEAN, defaultValue: true  },
  canViewPayments:      { type: DataTypes.BOOLEAN, defaultValue: false },
  canHandleMaintenance: { type: DataTypes.BOOLEAN, defaultValue: true  },
  canCreateProperty:    { type: DataTypes.BOOLEAN, defaultValue: false },
  canViewTenants:       { type: DataTypes.BOOLEAN, defaultValue: true  },
  canRespondDisputes:   { type: DataTypes.BOOLEAN, defaultValue: false },

  // ── Assignment lifecycle ───────────────────────────────────────────────────
  isActive:  { type: DataTypes.BOOLEAN, defaultValue: true },
  expiresAt: { type: DataTypes.DATE,    allowNull: true    },

}, {
  tableName:  "agent_properties",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["agentId", "propertyId"],
      name:   "unique_agent_property",
    },
  ],
});

module.exports = AgentProperty;