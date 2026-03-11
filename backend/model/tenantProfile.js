// model/tenantProfile.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TenantProfile = sequelize.define(
  "TenantProfile",
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    nationalId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    momoNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Preferred Mobile Money number for automated rent payments",
    },
    emergencyContactName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emergencyContactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currentAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "tenant_profiles",
    timestamps: true,
  }
);

module.exports = TenantProfile;