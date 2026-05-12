// model/platformAgreement.js
const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const PlatformAgreement = sequelize.define("PlatformAgreement", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },

  // Who signed (landlord or agent)
  userId: {
    type:      DataTypes.UUID,
    allowNull: false,
    references: { model: "users", key: "id" },
    onDelete:  "CASCADE",
  },

  userRole: {
    type:      DataTypes.ENUM("landlord", "agent"),
    allowNull: false,
  },

  // Agreement version — bump when terms change
  agreementVersion: {
    type:         DataTypes.STRING,
    allowNull:    false,
    defaultValue: "1.0.0",
  },

  // The 8 terms the user checked (stored for audit trail)
  acceptedTerms: {
    type:      DataTypes.JSON,
    allowNull: false,
  },

  // Digital signature (base64 image or typed name)
  userSignature: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },

  // Platform countersignature (set by admin when they approve)
  platformSignature: {
    type:         DataTypes.STRING,
    allowNull:    true,
    defaultValue: "InzuTrust Platform — Digital Countersignature",
  },

  // Who from admin side countersigned (null = auto-approved)
  countersignedBy: {
    type:      DataTypes.UUID,
    allowNull: true,
  },

  countersignedAt: {
    type:      DataTypes.DATE,
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM(
      "pending",    // user submitted, waiting admin review
      "active",     // countersigned and in effect
      "expired",    // version outdated, re-sign required
      "revoked"     // admin revoked access
    ),
    defaultValue: "pending",
  },

  // When this agreement expires (null = never)
  expiresAt: {
    type:      DataTypes.DATE,
    allowNull: true,
  },

  // If revoked, why
  revocationReason: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },

  // IP address at time of signing
  signedFromIp: {
    type:      DataTypes.STRING,
    allowNull: true,
  },

  signedAt: {
    type:      DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },

}, {
  tableName:  "platform_agreements",
  timestamps: true,
  indexes: [
    {
      // One active agreement per user per version
      unique: true,
      fields: ["userId", "agreementVersion"],
      name:   "unique_user_agreement_version",
    },
  ],
});

module.exports = PlatformAgreement;