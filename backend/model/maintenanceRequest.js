// model/maintenanceRequest.js
// A tenant or landlord files a maintenance request for a property.
// Lifecycle: open → in_progress → resolved | rejected | cancelled
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const MaintenanceRequest = sequelize.define("MaintenanceRequest", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },

  // ── Core references ────────────────────────────────────────────────────────
  propertyId: { type: DataTypes.UUID, allowNull: false },
  tenantId:   { type: DataTypes.UUID, allowNull: false }, // who filed it
  landlordId: { type: DataTypes.UUID, allowNull: false }, // property owner

  // Agent who is handling it (if assigned by landlord)
  assignedAgentId: { type: DataTypes.UUID, allowNull: true },

  // ── Request details ────────────────────────────────────────────────────────
  title: {
    type:      DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type:      DataTypes.TEXT,
    allowNull: false,
  },

  category: {
    type: DataTypes.ENUM(
      "plumbing",
      "electrical",
      "structural",
      "appliance",
      "pest_control",
      "cleaning",
      "security",
      "internet",
      "other"
    ),
    defaultValue: "other",
  },

  priority: {
    type:         DataTypes.ENUM("low", "medium", "high", "emergency"),
    defaultValue: "medium",
  },

  status: {
    type:         DataTypes.ENUM("open", "acknowledged", "in_progress", "resolved", "rejected", "cancelled"),
    defaultValue: "open",
  },

  // ── Evidence photos (uploaded by tenant) ──────────────────────────────────
  // Array of Cloudinary URLs
  images: {
    type:      DataTypes.JSON,
    allowNull: true,
  },

  // ── Resolution ────────────────────────────────────────────────────────────
  // Landlord/agent notes when closing the ticket
  resolutionNote: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },

  // Estimated date landlord/agent provides for fix
  scheduledAt: {
    type:      DataTypes.DATE,
    allowNull: true,
  },

  resolvedAt: {
    type:      DataTypes.DATE,
    allowNull: true,
  },

  // ── Tenant rating after resolution ────────────────────────────────────────
  tenantRating: {
    type:      DataTypes.INTEGER, // 1-5
    allowNull: true,
  },

  tenantFeedback: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },

}, {
  tableName:  "maintenance_requests",
  timestamps: true,
  indexes:    [],
});

module.exports = MaintenanceRequest;