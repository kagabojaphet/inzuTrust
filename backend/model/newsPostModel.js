// model/newsPostModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NewsPost = sequelize.define(
  "NewsPost",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    title: { type: DataTypes.STRING, allowNull: false },

    content: { type: DataTypes.TEXT, allowNull: false },

    image: { type: DataTypes.STRING, allowNull: true },

    authorId: { type: DataTypes.INTEGER, allowNull: false },

    shareCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: "news_posts",
    timestamps: true,
  }
);

module.exports = NewsPost;