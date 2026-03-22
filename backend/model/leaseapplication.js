// models/leaseApplicationModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LeaseApplication = sequelize.define("LeaseApplication", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  tenantId:   { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
  landlordId: { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
  propertyId: { type: DataTypes.UUID, allowNull: false, references: { model: "properties", key: "id" } },

  // draft → pending → accepted → rejected
  status: {
    type: DataTypes.ENUM("draft", "pending", "accepted", "rejected"),
    defaultValue: "draft",
  },

  message:    { type: DataTypes.TEXT,    allowNull: true },
  moveInDate: { type: DataTypes.DATEONLY, allowNull: true },
  duration:   { type: DataTypes.INTEGER, allowNull: true, defaultValue: 12 },

  landlordNote: { type: DataTypes.TEXT, allowNull: true },
  respondedAt:  { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: "lease_applications",
  timestamps: true,
});

module.exports = LeaseApplication;