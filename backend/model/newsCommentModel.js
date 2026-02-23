// model/newsCommentModel.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const NewsComment = sequelize.define(
  "NewsComment",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    newsPostId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },

    text: { type: DataTypes.TEXT, allowNull: false },
  },
  { tableName: "news_comments" }
);

module.exports = NewsComment;