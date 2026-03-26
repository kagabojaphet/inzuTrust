// model/propertyModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Property = sequelize.define(
  "Property",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // ── No `references` blocks anywhere in this file ───────────────────────────
    // Sequelize creates an index for every `references` declaration.
    // With many models, this pushes MySQL past its 64-key-per-table limit.
    // Relationships are fully handled by associations in model/index.js instead.

    landlordId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("house", "apartment", "room", "land", "commercial"),
      allowNull: false,
      defaultValue: "house",
    },

    district: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    sector: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    rentAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("available", "occupied"),
      defaultValue: "available",
    },

    mainImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    // ── Verification fields (for admin property verification flow) ─────────────
    verificationStatus: {
      type: DataTypes.ENUM("pending", "under_review", "verified", "rejected"),
      defaultValue: "pending",
    },

    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Stored as STRING(36) — avoids Sequelize creating a FK index for this column
    verifiedBy: {
      type: DataTypes.STRING(36),
      allowNull: true,
    },

    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ── Document flags ─────────────────────────────────────────────────────────
    upiNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    hasLandTitle: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    hasTaxProof: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    hasOwnerIdDoc: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // ── Location coords ────────────────────────────────────────────────────────
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
  },
  {
    tableName: "properties",
    timestamps: true,
    indexes: [], // ← prevent Sequelize from auto-generating extra indexes
  }
);

module.exports = Property;