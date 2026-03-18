// models/paymentModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  tenantId:    { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
  landlordId:  { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
  propertyId:  { type: DataTypes.UUID, allowNull: true,  references: { model: "properties", key: "id" } },
  agreementId: { type: DataTypes.UUID, allowNull: true,  references: { model: "agreements", key: "id" } },

  amount:    { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  type:      { type: DataTypes.ENUM("rent", "deposit", "fee", "penalty"), defaultValue: "rent" },
  method:    { type: DataTypes.ENUM("momo", "bank", "cash", "escrow"), allowNull: true },
  reference: { type: DataTypes.STRING, allowNull: true },

  dueDate: { type: DataTypes.DATEONLY, allowNull: true },
  paidAt:  { type: DataTypes.DATE,     allowNull: true },

  status: {
    type: DataTypes.ENUM("pending", "paid", "late", "missed", "refunded"),
    defaultValue: "pending",
  },

  inEscrow:   { type: DataTypes.BOOLEAN, defaultValue: false },
  releasedAt: { type: DataTypes.DATE,    allowNull: true },
  releasedBy: { type: DataTypes.UUID,    allowNull: true },

  note: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: "payments",
  timestamps: true,
});

module.exports = Payment;