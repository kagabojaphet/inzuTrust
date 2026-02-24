// model/newsPostModel.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const NewsPost = sequelize.define(
  "NewsPost",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    title: { type: DataTypes.STRING, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },

    // optional image url (cloudinary) or local path
    coverImage: { type: DataTypes.STRING, allowNull: true },

    likeCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    dislikeCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    commentCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    shareCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

    status: {
      type: DataTypes.ENUM("DRAFT", "PUBLISHED"),
      allowNull: false,
      defaultValue: "PUBLISHED",
    },
  },
  { tableName: "news_posts" }
);

module.exports = NewsPost;