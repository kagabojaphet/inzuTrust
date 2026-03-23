const sequelize = require("../config/database");

const User = require("./userModel");
const TenantProfile = require("./tenantProfile"); // New
const LandlordProfile = require("./landlordProfile"); // New
const Property = require("./propertyModel");
const Contact = require("./contactModel");


const NewsPost = require("./newsPostModel");
const NewsReaction = require("./newsReactionModel");
const NewsComment = require("./newsCommentModel");

const db = {};

db.sequelize = sequelize;
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======

// Models
>>>>>>> 47d2d9b (Add News feature: posts, likes, dislikes, comments, shares and image upload)
db.User = User;
db.Property = Property;
db.Contact = Contact;
>>>>>>> 4cf61aa (nongereyemo  Contact Us feature with auto reply using nodemailer)

<<<<<<< HEAD
// Models
db.User = User;
db.TenantProfile = TenantProfile;
db.LandlordProfile = LandlordProfile;
db.Property        = Property;
db.Contact         = Contact;
db.NewsPost        = NewsPost;
db.NewsReaction    = NewsReaction;
db.NewsComment     = NewsComment;
db.Favorite        = Favorite;
db.ViewingRequest  = ViewingRequest;

db.LeaseApplication = LeaseApplication;
db.Agreement        = Agreement;
db.Payment          = Payment;
db.Dispute          = Dispute;
db.DisputeMessage   = DisputeMessage;
db.DisputeEvidence  = DisputeEvidence;
db.Message          = Message;
db.TrustScoreLog    = TrustScoreLog;
db.Notification     = Notification;


/* ===========================
    Meeting Relationships
=========================== */
db.User.hasMany(db.Meeting, {
  foreignKey: "organizerId",
  as:         "organizedMeetings",
  onDelete:   "CASCADE",
});
db.Meeting.belongsTo(db.User, {
  foreignKey: "organizerId",
  as:         "organizer",
});
 
db.User.hasMany(db.Meeting, {
  foreignKey: "participantId",
  as:         "participatingMeetings",
  onDelete:   "CASCADE",
});
db.Meeting.belongsTo(db.User, {
  foreignKey: "participantId",
  as:         "participant",
});


/* ===========================
    Profile Relationships
=========================== */

db.User.hasOne(db.TenantProfile, {
  foreignKey: "userId",
  as: "tenantProfile",
  onDelete: "CASCADE",
});
db.TenantProfile.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

db.User.hasOne(db.LandlordProfile, {
  foreignKey: "userId",
  as: "landlordProfile",
  onDelete: "CASCADE",
});
db.LandlordProfile.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

/* ===========================
    Property Relationships
=========================== */

db.User.hasMany(db.Property, {
  foreignKey: "landlordId",
  as: "ownedProperties",
  onDelete: "CASCADE",
});

=======
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

>>>>>>> 47d2d9b (Add News feature: posts, likes, dislikes, comments, shares and image upload)
db.Property.belongsTo(db.User, {
  foreignKey: "landlordId",
  as: "landlord",
});

/* ===========================
<<<<<<< HEAD
    News Relationships
=========================== */

=======
   News Relationships
=========================== */

// A User creates many NewsPosts
>>>>>>> 47d2d9b (Add News feature: posts, likes, dislikes, comments, shares and image upload)
db.User.hasMany(db.NewsPost, {
  foreignKey: "authorId",
  as: "newsPosts",
  onDelete: "CASCADE",
});
db.NewsPost.belongsTo(db.User, {
  foreignKey: "authorId",
  as: "author",
});

<<<<<<< HEAD
=======
// NewsPost -> Reactions (like/dislike)
>>>>>>> 47d2d9b (Add News feature: posts, likes, dislikes, comments, shares and image upload)
db.NewsPost.hasMany(db.NewsReaction, {
  foreignKey: "newsPostId",
  as: "reactions",
  onDelete: "CASCADE",
});
db.NewsReaction.belongsTo(db.NewsPost, {
  foreignKey: "newsPostId",
  as: "newsPost",
});

<<<<<<< HEAD
=======
// User -> Reactions
>>>>>>> 47d2d9b (Add News feature: posts, likes, dislikes, comments, shares and image upload)
db.User.hasMany(db.NewsReaction, {
  foreignKey: "userId",
  as: "newsReactions",
  onDelete: "CASCADE",
});
db.NewsReaction.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

<<<<<<< HEAD
=======
// NewsPost -> Comments
>>>>>>> 47d2d9b (Add News feature: posts, likes, dislikes, comments, shares and image upload)
db.NewsPost.hasMany(db.NewsComment, {
  foreignKey: "newsPostId",
  as: "comments",
  onDelete: "CASCADE",
});
db.NewsComment.belongsTo(db.NewsPost, {
  foreignKey: "newsPostId",
  as: "newsPost",
});

<<<<<<< HEAD
=======
// User -> Comments
>>>>>>> 47d2d9b (Add News feature: posts, likes, dislikes, comments, shares and image upload)
db.User.hasMany(db.NewsComment, {
  foreignKey: "userId",
  as: "newsComments",
  onDelete: "CASCADE",
});
db.NewsComment.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
<<<<<<< HEAD
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

db.Property.hasMany(db.ViewingRequest, {
  foreignKey: "propertyId",
  as: "viewingRequests",
  onDelete: "CASCADE",
});
db.ViewingRequest.belongsTo(db.Property, {
  foreignKey: "propertyId",
  as: "property",
});

db.User.hasMany(db.ViewingRequest, {
  foreignKey: "tenantId",
  as: "tenantViewingRequests",
  onDelete: "CASCADE",
});
db.ViewingRequest.belongsTo(db.User, {
  foreignKey: "tenantId",
  as: "tenant",
});

db.User.hasMany(db.ViewingRequest, {
  foreignKey: "landlordId",
  as: "landlordViewingRequests",
  onDelete: "CASCADE",
});
db.ViewingRequest.belongsTo(db.User, {
  foreignKey: "landlordId",
  as: "landlord",
=======
>>>>>>> 47d2d9b (Add News feature: posts, likes, dislikes, comments, shares and image upload)
});

module.exports = db;