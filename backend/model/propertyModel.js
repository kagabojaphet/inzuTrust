const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Property = sequelize.define(
  "Property",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    landlordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      type: DataTypes.JSON, // array of Cloudinary URLs
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    tableName: "properties",
    timestamps: true,
    
  }
);

module.exports = Property;