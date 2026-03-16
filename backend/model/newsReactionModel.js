const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NewsReaction = sequelize.define(
  "NewsReaction",
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
        fields: ["userId", "newsPostId"],
      },
    ],
  }
);

module.exports = NewsReaction;