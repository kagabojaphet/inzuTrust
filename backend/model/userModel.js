const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName:  { type: DataTypes.STRING, allowNull: false },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:   true,
    validate: { isEmail: true },
  },
  password:  { type: DataTypes.STRING, allowNull: true },
  phone:     { type: DataTypes.STRING, allowNull: true },
  authType:  { type: DataTypes.STRING, defaultValue: "email" }, 
  role: {
    type:         DataTypes.ENUM("tenant", "landlord","agent", "admin"),
    defaultValue: "tenant",
  },
  
  isEmailVerified: { 
  type: DataTypes.BOOLEAN, 
  defaultValue: false 
},
isVerified: { // Keep this for Admin/KYC only
  type: DataTypes.BOOLEAN, 
  defaultValue: false 
},
  // Red Flag indicates a warning status in the UI
  isRedFlagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Suspended users cannot log in
  isSuspended: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
  },

  otp:        { type: DataTypes.STRING,  allowNull: true },
  otpExpiry:  { type: DataTypes.DATE,    allowNull: true },

  lastSeenAt: {
    type:         DataTypes.DATE,
    allowNull:    true,
    defaultValue: null,
  },
}, {
  tableName:  "users",
  timestamps: true,
});

module.exports = User;