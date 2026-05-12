// model/propertyReview.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PropertyReview = sequelize.define(
  "PropertyReview",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // The tenant who left the review
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // 1–5 stars
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "property_reviews",
    timestamps: true,
    indexes: [
      // One review per tenant per property
      {
        unique: true,
        fields: ["propertyId", "tenantId"],
        name: "unique_tenant_review",
      },
    ],
  }
);

module.exports = PropertyReview;