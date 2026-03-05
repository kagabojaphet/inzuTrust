// model/index.js
const sequelize = require("../config/database");

const User = require("./userModel");
const Property = require("./propertyModel");
const Contact = require("./contactModel");


const NewsPost = require("./newsPostModel");
const NewsReaction = require("./newsReactionModel");
const NewsComment = require("./newsCommentModel");

const db = {};

db.sequelize = sequelize;

// Models
db.User = User;
db.Property = Property;
db.Contact = Contact;

db.NewsPost = NewsPost;
db.NewsReaction = NewsReaction;
db.NewsComment = NewsComment;

/* ===========================
   Relationships
=========================== */

// User (Landlord) -> Properties
db.User.hasMany(db.Property, {
  foreignKey: "landlordId",
  as: "ownedProperties",
  onDelete: "CASCADE",
});

db.Property.belongsTo(db.User, {
  foreignKey: "landlordId",
  as: "landlord",
});

/* ===========================
   News Relationships
=========================== */

// A User creates many NewsPosts
db.User.hasMany(db.NewsPost, {
  foreignKey: "authorId",
  as: "newsPosts",
  onDelete: "CASCADE",
});

db.NewsPost.belongsTo(db.User, {
  foreignKey: "authorId",
  as: "author",
});

// NewsPost -> Reactions (like/dislike)
db.NewsPost.hasMany(db.NewsReaction, {
  foreignKey: "newsPostId",
  as: "reactions",
  onDelete: "CASCADE",
});

db.NewsReaction.belongsTo(db.NewsPost, {
  foreignKey: "newsPostId",
  as: "newsPost",
});

// User -> Reactions
db.User.hasMany(db.NewsReaction, {
  foreignKey: "userId",
  as: "newsReactions",
  onDelete: "CASCADE",
});

db.NewsReaction.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

// NewsPost -> Comments
db.NewsPost.hasMany(db.NewsComment, {
  foreignKey: "newsPostId",
  as: "comments",
  onDelete: "CASCADE",
});

db.NewsComment.belongsTo(db.NewsPost, {
  foreignKey: "newsPostId",
  as: "newsPost",
});

// User -> Comments
db.User.hasMany(db.NewsComment, {
  foreignKey: "userId",
  as: "newsComments",
  onDelete: "CASCADE",
});

db.NewsComment.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = db;