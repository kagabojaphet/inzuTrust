// model/viewingRequestModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ViewingRequest = sequelize.define(
  "ViewingRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    landlordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    propertyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    preferredDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "viewing_requests",
    timestamps: true,
  }
);

module.exports = ViewingRequest;