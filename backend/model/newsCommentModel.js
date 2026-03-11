// model/newsCommentModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NewsComment = sequelize.define(
  "NewsComment",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    userId: { type: DataTypes.INTEGER, allowNull: false },

    newsPostId: { type: DataTypes.INTEGER, allowNull: false },

    content: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: "news_comments",
    timestamps: true,
  }
);

module.exports = NewsComment;