const sequelize = require("../config/database");

const User = require("./userModel");
const Property = require("./propertyModel");

const NewsPost = require("./newsPostModel");
const NewsReaction = require("./newsReactionModel");
const NewsComment = require("./newsCommentModel");

const db = {};

db.sequelize = sequelize;

// Models
db.User = User;
db.Property = Property;
db.NewsPost = NewsPost;
db.NewsReaction = NewsReaction;
db.NewsComment = NewsComment;

/* =========================
   PROPERTY ASSOCIATIONS
========================= */
db.User.hasMany(db.Property, {
  foreignKey: "landlordId",
  as: "properties",
});
db.Property.belongsTo(db.User, {
  foreignKey: "landlordId",
  as: "landlord",
});

/* =========================
   NEWS ASSOCIATIONS
========================= */

// NewsPost → Reactions
db.NewsPost.hasMany(db.NewsReaction, {
  foreignKey: "newsPostId",
  onDelete: "CASCADE",
});
db.NewsReaction.belongsTo(db.NewsPost, {
  foreignKey: "newsPostId",
});

// NewsPost → Comments
db.NewsPost.hasMany(db.NewsComment, {
  foreignKey: "newsPostId",
  onDelete: "CASCADE",
});
db.NewsComment.belongsTo(db.NewsPost, {
  foreignKey: "newsPostId",
});

// User → Reactions
db.User.hasMany(db.NewsReaction, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
db.NewsReaction.belongsTo(db.User, {
  foreignKey: "userId",
});

// User → Comments
db.User.hasMany(db.NewsComment, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
db.NewsComment.belongsTo(db.User, {
  foreignKey: "userId",
});

module.exports = db;