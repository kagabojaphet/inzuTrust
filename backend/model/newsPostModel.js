const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NewsPost = sequelize.define(
  "NewsPost",
  {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
    authorId: { 
      type: DataTypes.UUID, 
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    shareCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: "news_posts",
    timestamps: true,
  }
);

module.exports = NewsPost;