// model/newsReactionModel.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const NewsReaction = sequelize.define(
  "NewsReaction",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    newsPostId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },

    type: { type: DataTypes.ENUM("LIKE", "DISLIKE"), allowNull: false },
  },
  {
    tableName: "news_reactions",
    indexes: [
      { unique: true, fields: ["newsPostId", "userId"] }, // one reaction per user per post
    ],
  }
);

module.exports = NewsReaction;