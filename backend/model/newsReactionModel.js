// model/newsReactionModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NewsReaction = sequelize.define(
  "NewsReaction",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    userId: { type: DataTypes.INTEGER, allowNull: false },

    newsPostId: { type: DataTypes.INTEGER, allowNull: false },

    type: {
      type: DataTypes.ENUM("like", "dislike"),
      allowNull: false,
    },
  },
  {
    tableName: "news_reactions",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "newsPostId"], // ✅ 1 reaction per user per post
      },
    ],
  }
);

module.exports = NewsReaction;