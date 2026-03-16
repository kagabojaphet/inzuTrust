const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ViewingRequest = sequelize.define(
  "ViewingRequest",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },

    landlordId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },

    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id',
      },
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