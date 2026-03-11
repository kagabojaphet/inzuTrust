// model/index.js
const sequelize = require("../config/database");

const User = require("./userModel");
const Property = require("./propertyModel");
const Contact = require("./contactModel");
const NewsPost = require("./newsPostModel");
const NewsReaction = require("./newsReactionModel");
const NewsComment = require("./newsCommentModel");
const Favorite = require("./favoriteModel");
const ViewingRequest = require("./viewingRequestModel");

const db = {};

db.sequelize = sequelize;

// Models
db.User = User;
db.Property = Property;
db.Contact = Contact;
db.NewsPost = NewsPost;
db.NewsReaction = NewsReaction;
db.NewsComment = NewsComment;
db.Favorite = Favorite;
db.ViewingRequest = ViewingRequest;

/* ===========================
   Property Relationships
=========================== */

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

db.User.hasMany(db.NewsPost, {
  foreignKey: "authorId",
  as: "newsPosts",
  onDelete: "CASCADE",
});

db.NewsPost.belongsTo(db.User, {
  foreignKey: "authorId",
  as: "author",
});

db.NewsPost.hasMany(db.NewsReaction, {
  foreignKey: "newsPostId",
  as: "reactions",
  onDelete: "CASCADE",
});

db.NewsReaction.belongsTo(db.NewsPost, {
  foreignKey: "newsPostId",
  as: "newsPost",
});

db.User.hasMany(db.NewsReaction, {
  foreignKey: "userId",
  as: "newsReactions",
  onDelete: "CASCADE",
});

db.NewsReaction.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

db.NewsPost.hasMany(db.NewsComment, {
  foreignKey: "newsPostId",
  as: "comments",
  onDelete: "CASCADE",
});

db.NewsComment.belongsTo(db.NewsPost, {
  foreignKey: "newsPostId",
  as: "newsPost",
});

db.User.hasMany(db.NewsComment, {
  foreignKey: "userId",
  as: "newsComments",
  onDelete: "CASCADE",
});

db.NewsComment.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

/* ===========================
   Favorite Relationships
=========================== */

db.User.hasMany(db.Favorite, {
  foreignKey: "userId",
  as: "favorites",
  onDelete: "CASCADE",
});

db.Favorite.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

db.Property.hasMany(db.Favorite, {
  foreignKey: "propertyId",
  as: "favorites",
  onDelete: "CASCADE",
});

db.Favorite.belongsTo(db.Property, {
  foreignKey: "propertyId",
  as: "property",
});
/* ===========================
   Viewing Request Relationships
=========================== */

// Property -> Viewing Requests
db.Property.hasMany(db.ViewingRequest, {
  foreignKey: "propertyId",
  as: "viewingRequests",
  onDelete: "CASCADE",
});

db.ViewingRequest.belongsTo(db.Property, {
  foreignKey: "propertyId",
  as: "property",
});

// User (tenant) -> Viewing Requests
db.User.hasMany(db.ViewingRequest, {
  foreignKey: "tenantId",
  as: "tenantViewingRequests",
  onDelete: "CASCADE",
});

db.ViewingRequest.belongsTo(db.User, {
  foreignKey: "tenantId",
  as: "tenant",
});

// User (landlord) -> Viewing Requests received
db.User.hasMany(db.ViewingRequest, {
  foreignKey: "landlordId",
  as: "landlordViewingRequests",
  onDelete: "CASCADE",
});

db.ViewingRequest.belongsTo(db.User, {
  foreignKey: "landlordId",
  as: "landlord",
});

module.exports = db;