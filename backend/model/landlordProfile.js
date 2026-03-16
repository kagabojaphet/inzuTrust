// model/landlordProfile.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LandlordProfile = sequelize.define(
  "LandlordProfile",
  {
    userId: {
      type: DataTypes.UUID, // MUST match User model id type
      primaryKey: true,
      references: {
        model: 'users', // Name of the target table
        key: 'id',      // Name of the target column
      },
      onDelete: 'CASCADE',
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // ... rest of your code stays the same
  },
  {
    tableName: "landlord_profiles",
    timestamps: true,
  }
);

module.exports = LandlordProfile;