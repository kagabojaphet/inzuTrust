// models/agreementModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Agreement = sequelize.define("Agreement", {
  id:    { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  docId: { type: DataTypes.STRING, allowNull: false, unique: true },

  landlordId:        { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
  tenantId:          { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
  propertyId:        { type: DataTypes.UUID, allowNull: false, references: { model: "properties", key: "id" } },
  leaseApplicationId:{ type: DataTypes.UUID, allowNull: true,  references: { model: "lease_applications", key: "id" } },

  landlordName: { type: DataTypes.STRING, allowNull: false },
  tenantName:   { type: DataTypes.STRING, allowNull: false },
  tenantEmail:  { type: DataTypes.STRING, allowNull: true },

  propertyAddress: { type: DataTypes.STRING, allowNull: true },
  district:        { type: DataTypes.STRING, allowNull: true },
  sector:          { type: DataTypes.STRING, allowNull: true },
  rentAmount:      { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  securityDeposit: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  leaseDuration:   { type: DataTypes.INTEGER, defaultValue: 12 },
  startDate:       { type: DataTypes.DATEONLY, allowNull: true },
  endDate:         { type: DataTypes.DATEONLY, allowNull: true },
  additionalTerms: { type: DataTypes.TEXT, allowNull: true },

  landlordSignature: { type: DataTypes.TEXT("long"), allowNull: true },
  tenantSignature:   { type: DataTypes.TEXT("long"), allowNull: true },

  status: {
    type: DataTypes.ENUM("draft", "pending_signature", "signed", "expired", "terminated"),
    defaultValue: "draft",
  },
  landlordSigned: { type: DataTypes.BOOLEAN, defaultValue: false },
  tenantSigned:   { type: DataTypes.BOOLEAN, defaultValue: false },
  signedAt:       { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: "agreements",
  timestamps: true,
});

module.exports = Agreement;