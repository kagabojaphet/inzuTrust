// model/propertyModel.js
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const Property = sequelize.define("Property", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },

  // Null when an agent creates their own independent listing
  landlordId: {
    type:      DataTypes.UUID,
    allowNull: true,
  },

  // Set when an agent created this (on behalf of landlord OR independently)
  createdByAgentId: {
    type:      DataTypes.UUID,
    allowNull: true,
  },

  title:    { type: DataTypes.STRING, allowNull: false },

  type: {
    type:         DataTypes.ENUM("house", "apartment", "room", "land", "commercial"),
    allowNull:    false,
    defaultValue: "house",
  },

  district: { type: DataTypes.STRING, allowNull: false },
  sector:   { type: DataTypes.STRING, allowNull: true  },
  address:  { type: DataTypes.STRING, allowNull: true  },

  rentAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },

  rentPeriod: {
    type:         DataTypes.ENUM("monthly", "yearly"),
    allowNull:    false,
    defaultValue: "monthly",
  },

  bedrooms:     { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
  bathrooms:    { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
  squareMeters: { type: DataTypes.INTEGER, allowNull: true },

  description: { type: DataTypes.TEXT,   allowNull: true },

  status: {
    type:         DataTypes.ENUM("available", "occupied"),
    defaultValue: "available",
  },

  mainImage: { type: DataTypes.STRING, allowNull: true },
  images:    { type: DataTypes.JSON,   allowNull: true },

  // ── Aggregated rating (recalculated on each review) ───────────────────────
  rating:      { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0.00 },
  reviewCount: { type: DataTypes.INTEGER,        allowNull: false, defaultValue: 0    },

  // ── Verification ──────────────────────────────────────────────────────────
  verificationStatus: {
    type:         DataTypes.ENUM("pending", "under_review", "verified", "rejected"),
    defaultValue: "pending",
  },
  verifiedAt:      { type: DataTypes.DATE,       allowNull: true },
  verifiedBy:      { type: DataTypes.STRING(36), allowNull: true },
  rejectionReason: { type: DataTypes.TEXT,       allowNull: true },

  // ── Documents ─────────────────────────────────────────────────────────────
  upiNumber:     { type: DataTypes.STRING,  allowNull: true },
  hasLandTitle:  { type: DataTypes.BOOLEAN, defaultValue: false },
  hasTaxProof:   { type: DataTypes.BOOLEAN, defaultValue: false },
  hasOwnerIdDoc: { type: DataTypes.BOOLEAN, defaultValue: false },

  // ── Location ──────────────────────────────────────────────────────────────
  latitude:  { type: DataTypes.DECIMAL(10, 8), allowNull: true },
  longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },

}, {
  tableName:  "properties",
  timestamps: true,
  indexes:    [],
});

module.exports = Property;