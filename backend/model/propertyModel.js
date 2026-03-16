// model/propertyModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Property = sequelize.define(
  "Property",
  {
    // CHANGE 1: Use UUID for the Property itself
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // CHANGE 2: landlordId must match User.id type (UUID)
    landlordId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("house", "apartment", "room", "land", "commercial"),
      allowNull: false,
      defaultValue: "house",
    },

    district: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    sector: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    rentAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("available", "occupied"),
      defaultValue: "available",
    },

    mainImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    images: {
      type: DataTypes.JSON, 
      allowNull: true,
    },
  },
  {
    tableName: "properties",
    timestamps: true,
  }
);

module.exports = Property;