const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TenantProfile = sequelize.define(
  "TenantProfile",
  {
    userId: {
      type: DataTypes.UUID, // Must match User model id type
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    nationalId: { type: DataTypes.STRING, allowNull: true, unique: true },
    dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
    momoNumber: { type: DataTypes.STRING, allowNull: true },
    emergencyContactName: { type: DataTypes.STRING, allowNull: true },
    emergencyContactPhone: { type: DataTypes.STRING, allowNull: true },
    currentAddress: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "tenant_profiles", timestamps: true }
);

module.exports = TenantProfile;