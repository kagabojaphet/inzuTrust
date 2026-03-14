const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true,
      validate: { isEmail: true }
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: true // Changed to allow null for Google users
    },
    phone: { type: DataTypes.STRING, allowNull: true },
   authType: {
  type: DataTypes.STRING,
  defaultValue: 'email', // Options: 'email' or 'google'
},
    role: { 
      type: DataTypes.ENUM("tenant", "landlord", "admin"), 
      defaultValue: "tenant" 
    },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    otp: { type: DataTypes.STRING, allowNull: true },
    otpExpiry: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "users", timestamps: true }
);

module.exports = User;