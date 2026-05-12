// model/agentProfile.js
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const AgentProfile = sequelize.define("AgentProfile", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,              // ← single primary key
  },

  userId: {
    type:      DataTypes.UUID,
    allowNull: false,
    unique:    true,
    references: { model: "users", key: "id" },
    onDelete:  "CASCADE",
  },

  // ── Professional info ──────────────────────────────────────────────────────
  licenseNumber:   { type: DataTypes.STRING,  allowNull: true },
  agencyName:      { type: DataTypes.STRING,  allowNull: true },
  agencyAddress:   { type: DataTypes.STRING,  allowNull: true },
  bio:             { type: DataTypes.TEXT,    allowNull: true },
  yearsExperience: { type: DataTypes.INTEGER, allowNull: true },
  specialization: {
    type:      DataTypes.ENUM("residential", "commercial", "land", "all"),
    allowNull: true,
  },

  // ── KYC ───────────────────────────────────────────────────────────────────
  idVerified:         { type: DataTypes.BOOLEAN, defaultValue: false },
  idDocumentUrl:      { type: DataTypes.STRING,  allowNull: true },
  licenseDocumentUrl: { type: DataTypes.STRING,  allowNull: true },

  // ── Stats ──────────────────────────────────────────────────────────────────
  totalListings:    { type: DataTypes.INTEGER, defaultValue: 0 },
  activeListings:   { type: DataTypes.INTEGER, defaultValue: 0 },
  totalAssignments: { type: DataTypes.INTEGER, defaultValue: 0 },
  disputesHandled:  { type: DataTypes.INTEGER, defaultValue: 0 },

  // ── Badges ────────────────────────────────────────────────────────────────
  badges: { type: DataTypes.JSON, defaultValue: [] },

  // ── Notification preferences ───────────────────────────────────────────────
  notifyEmail: { type: DataTypes.BOOLEAN, defaultValue: true },
  notifySMS:   { type: DataTypes.BOOLEAN, defaultValue: true },
  notifyApp:   { type: DataTypes.BOOLEAN, defaultValue: true },

}, {
  tableName:  "agent_profiles",
  timestamps: true,
});

module.exports = AgentProfile;