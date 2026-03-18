const sequelize = require("../config/database");

// ── Existing models ───────────────────────────────────────────────────────────
const User            = require("./userModel");
const TenantProfile   = require("./tenantProfile");
const LandlordProfile = require("./landlordProfile");
const Property        = require("./propertyModel");
const Contact         = require("./contactModel");
const NewsPost        = require("./newsPostModel");
const NewsReaction    = require("./newsReactionModel");
const NewsComment     = require("./newsCommentModel");
const Favorite        = require("./favoriteModel");
const ViewingRequest  = require("./viewingRequestModel");

// ── New models (Corrected to match your actual filenames) ─────────────────────
// NOTE: I changed these to match the 📜 icons in your folder tree exactly.
const LeaseApplication = require("./leaseapplication"); // was leaseApplicationModel
const Agreement        = require("./agreement");        // was agreementModel
const Payment          = require("./payment");          // was paymentModel
const Dispute          = require("./dispute");          // was disputeModel
const DisputeMessage   = require("./disputeMessage");   // was disputeMessageModel
const DisputeEvidence  = require("./disputeEvidence");  // was disputeEvidenceModel
const Message          = require("./message");          // was messageModel
const TrustScoreLog    = require("./trustScoreLog");    // was trustScoreLogModel
const Notification     = require("./notification");     // was notificationModel

const db = {};

db.sequelize = sequelize;

// ── Attach all models ─────────────────────────────────────────────────────────
db.User            = User;
db.TenantProfile   = TenantProfile;
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
});

/* ===========================
    LeaseApplication Relationships
=========================== */

db.User.hasMany(db.LeaseApplication, {
  foreignKey: "tenantId",
  as: "myApplications",
  onDelete: "CASCADE",
});
db.LeaseApplication.belongsTo(db.User, {
  foreignKey: "tenantId",
  as: "tenant",
});

db.User.hasMany(db.LeaseApplication, {
  foreignKey: "landlordId",
  as: "receivedApplications",
  onDelete: "CASCADE",
});
db.LeaseApplication.belongsTo(db.User, {
  foreignKey: "landlordId",
  as: "landlord",
});

db.Property.hasMany(db.LeaseApplication, {
  foreignKey: "propertyId",
  as: "applications",
  onDelete: "CASCADE",
});
db.LeaseApplication.belongsTo(db.Property, {
  foreignKey: "propertyId",
  as: "property",
});

/* ===========================
    Agreement Relationships
=========================== */

db.User.hasMany(db.Agreement, {
  foreignKey: "landlordId",
  as: "landlordAgreements",
  onDelete: "CASCADE",
});
db.Agreement.belongsTo(db.User, {
  foreignKey: "landlordId",
  as: "landlord",
});

db.User.hasMany(db.Agreement, {
  foreignKey: "tenantId",
  as: "tenantAgreements",
  onDelete: "CASCADE",
});
db.Agreement.belongsTo(db.User, {
  foreignKey: "tenantId",
  as: "tenant",
});

db.Property.hasMany(db.Agreement, {
  foreignKey: "propertyId",
  as: "agreements",
  onDelete: "CASCADE",
});
db.Agreement.belongsTo(db.Property, {
  foreignKey: "propertyId",
  as: "property",
});

db.LeaseApplication.hasOne(db.Agreement, {
  foreignKey: "leaseApplicationId",
  as: "agreement",
});
db.Agreement.belongsTo(db.LeaseApplication, {
  foreignKey: "leaseApplicationId",
  as: "application",
});

/* ===========================
    Payment Relationships
=========================== */

db.User.hasMany(db.Payment, {
  foreignKey: "tenantId",
  as: "tenantPayments",
  onDelete: "CASCADE",
});
db.Payment.belongsTo(db.User, {
  foreignKey: "tenantId",
  as: "tenant",
});

db.User.hasMany(db.Payment, {
  foreignKey: "landlordId",
  as: "landlordPayments",
  onDelete: "CASCADE",
});
db.Payment.belongsTo(db.User, {
  foreignKey: "landlordId",
  as: "landlord",
});

db.Agreement.hasMany(db.Payment, {
  foreignKey: "agreementId",
  as: "payments",
  onDelete: "CASCADE",
});
db.Payment.belongsTo(db.Agreement, {
  foreignKey: "agreementId",
  as: "agreement",
});

db.Property.hasMany(db.Payment, {
  foreignKey: "propertyId",
  as: "payments",
  onDelete: "CASCADE",
});
db.Payment.belongsTo(db.Property, {
  foreignKey: "propertyId",
  as: "property",
});

/* ===========================
    Dispute Relationships
=========================== */

db.User.hasMany(db.Dispute, {
  foreignKey: "reporterId",
  as: "filedDisputes",
  onDelete: "CASCADE",
});
db.Dispute.belongsTo(db.User, {
  foreignKey: "reporterId",
  as: "reporter",
});

db.User.hasMany(db.Dispute, {
  foreignKey: "respondentId",
  as: "receivedDisputes",
  onDelete: "SET NULL",
});
db.Dispute.belongsTo(db.User, {
  foreignKey: "respondentId",
  as: "respondent",
});

db.Property.hasMany(db.Dispute, {
  foreignKey: "propertyId",
  as: "disputes",
  onDelete: "SET NULL",
});
db.Dispute.belongsTo(db.Property, {
  foreignKey: "propertyId",
  as: "property",
});

db.Dispute.hasMany(db.DisputeMessage, {
  foreignKey: "disputeId",
  as: "messages",
  onDelete: "CASCADE",
});
db.DisputeMessage.belongsTo(db.Dispute, {
  foreignKey: "disputeId",
  as: "dispute",
});

db.User.hasMany(db.DisputeMessage, {
  foreignKey: "senderId",
  as: "disputeMessages",
  onDelete: "CASCADE",
});
db.DisputeMessage.belongsTo(db.User, {
  foreignKey: "senderId",
  as: "sender",
});

db.Dispute.hasMany(db.DisputeEvidence, {
  foreignKey: "disputeId",
  as: "evidence",
  onDelete: "CASCADE",
});
db.DisputeEvidence.belongsTo(db.Dispute, {
  foreignKey: "disputeId",
  as: "dispute",
});

db.User.hasMany(db.DisputeEvidence, {
  foreignKey: "uploadedBy",
  as: "uploadedEvidence",
  onDelete: "CASCADE",
});
db.DisputeEvidence.belongsTo(db.User, {
  foreignKey: "uploadedBy",
  as: "uploader",
});

/* ===========================
    Message Relationships
=========================== */

db.User.hasMany(db.Message, {
  foreignKey: "senderId",
  as: "sentMessages",
  onDelete: "CASCADE",
});
db.Message.belongsTo(db.User, {
  foreignKey: "senderId",
  as: "sender",
});

db.User.hasMany(db.Message, {
  foreignKey: "receiverId",
  as: "receivedMessages",
  onDelete: "CASCADE",
});
db.Message.belongsTo(db.User, {
  foreignKey: "receiverId",
  as: "receiver",
});

/* ===========================
    TrustScoreLog Relationships
=========================== */

db.User.hasMany(db.TrustScoreLog, {
  foreignKey: "tenantId",
  as: "trustScoreLogs",
  onDelete: "CASCADE",
});
db.TrustScoreLog.belongsTo(db.User, {
  foreignKey: "tenantId",
  as: "tenant",
});

/* ===========================
    Notification Relationships
=========================== */

db.User.hasMany(db.Notification, {
  foreignKey: "userId",
  as: "notifications",
  onDelete: "CASCADE",
});
db.Notification.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = db;