// model/landlordProfile.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LandlordProfile = sequelize.define(
  "LandlordProfile",
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true, // Optional for individual landlords
    },
    tinNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    businessAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isUrl: true },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "landlord_profiles",
    timestamps: true,
  }
);

module.exports = LandlordProfile;