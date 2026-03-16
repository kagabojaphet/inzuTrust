const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NewsComment = sequelize.define(
  "NewsComment",
  {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    userId: { 
      type: DataTypes.UUID, 
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    newsPostId: { 
      type: DataTypes.UUID, 
      allowNull: false,
      references: {
        model: 'news_posts',
        key: 'id'
      }
    },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: "news_comments",
    timestamps: true,
  }
);

module.exports = NewsComment;