// model/index.js
const sequelize = require("../config/database");

// ── Model imports ─────────────────────────────────────────────────────────────
const PlatformAgreement = require("./platformAgreement");
const User               = require("./userModel");
const TenantProfile      = require("./tenantProfile");
const LandlordProfile    = require("./landlordProfile");
const AgentProfile       = require("./agentProfile");
const Property           = require("./propertyModel");
const PropertyReview     = require("./propertyReview");
const AgentProperty      = require("./agentProperty");
const Agreement          = require("./agreement");
const LeaseApplication   = require("./leaseapplication");
const Payment            = require("./payment");
const MaintenanceRequest = require("./maintenanceRequest");
const MaintenanceComment = require("./maintenanceComment");
const Meeting            = require("./meetingModel");
const ViewingRequest     = require("./viewingRequestModel");
const Dispute            = require("./dispute");
const DisputeMessage     = require("./disputeMessage");
const DisputeEvidence    = require("./disputeEvidence");
const Message            = require("./message");
const Notification       = require("./notification");
const TrustScoreLog      = require("./trustScoreLog");
const Favorite           = require("./favoriteModel");
const Contact            = require("./contactModel");
const NewsPost           = require("./newsPostModel");
const NewsReaction       = require("./newsReactionModel");
const NewsComment        = require("./newsCommentModel");
const AuditLog           = require("./auditLog");


const db = {};
db.sequelize = sequelize;

// ── Attach all models ─────────────────────────────────────────────────────────
db.User               = User;
db.TenantProfile      = TenantProfile;
db.LandlordProfile    = LandlordProfile;
db.AgentProfile       = AgentProfile;
db.Property           = Property;
db.PropertyReview     = PropertyReview;
db.AgentProperty      = AgentProperty;
db.Agreement          = Agreement;
db.LeaseApplication   = LeaseApplication;
db.Payment            = Payment;
db.MaintenanceRequest = MaintenanceRequest;
db.MaintenanceComment = MaintenanceComment;
db.Meeting            = Meeting;
db.ViewingRequest     = ViewingRequest;
db.Dispute            = Dispute;
db.DisputeMessage     = DisputeMessage;
db.DisputeEvidence    = DisputeEvidence;
db.Message            = Message;
db.Notification       = Notification;
db.TrustScoreLog      = TrustScoreLog;
db.Favorite           = Favorite;
db.Contact            = Contact;
db.NewsPost           = NewsPost;
db.NewsReaction       = NewsReaction;
db.NewsComment        = NewsComment;
db.AuditLog           = AuditLog;
db.PlatformAgreement = PlatformAgreement;

/* ══════════════════════════════════════════════════════════════════════════════
   ASSOCIATIONS
══════════════════════════════════════════════════════════════════════════════ */

/* ── User Profiles (one-to-one) ───────────────────────────────────────────── */
db.User.hasOne(db.TenantProfile,   { foreignKey: "userId", as: "tenantProfile",   onDelete: "CASCADE" });
db.TenantProfile.belongsTo(db.User,   { foreignKey: "userId", as: "user" });

db.User.hasOne(db.LandlordProfile, { foreignKey: "userId", as: "landlordProfile", onDelete: "CASCADE" });
db.LandlordProfile.belongsTo(db.User, { foreignKey: "userId", as: "user" });

db.User.hasOne(db.AgentProfile,    { foreignKey: "userId", as: "agentProfile",    onDelete: "CASCADE" });
db.AgentProfile.belongsTo(db.User,    { foreignKey: "userId", as: "user" });

/* ── PlatformAgreement ──────────────────────────────────────────────────────── */
db.User.hasMany(db.PlatformAgreement,     { foreignKey: "userId",           as: "platformAgreements",    onDelete: "CASCADE"  });
db.PlatformAgreement.belongsTo(db.User,   { foreignKey: "userId",           as: "signer" });
db.User.hasMany(db.PlatformAgreement,     { foreignKey: "countersignedBy",  as: "countersignedAgreements", onDelete: "SET NULL" });
db.PlatformAgreement.belongsTo(db.User,   { foreignKey: "countersignedBy",  as: "adminCountersigner" });

/* ── Property ownership ────────────────────────────────────────────────────── */
db.User.hasMany(db.Property, { foreignKey: "landlordId",      as: "ownedProperties",       onDelete: "CASCADE"  });
db.Property.belongsTo(db.User, { foreignKey: "landlordId",    as: "landlord" });

db.User.hasMany(db.Property, { foreignKey: "createdByAgentId", as: "agentCreatedProperties", onDelete: "SET NULL" });
db.Property.belongsTo(db.User, { foreignKey: "createdByAgentId", as: "listingAgent" });

/* ── Agent ↔ Property assignments ─────────────────────────────────────────── */
db.User.hasMany(db.AgentProperty,     { foreignKey: "agentId",      as: "agentAssignments",   onDelete: "CASCADE" });
db.AgentProperty.belongsTo(db.User,   { foreignKey: "agentId",      as: "agent" });

db.Property.hasMany(db.AgentProperty,    { foreignKey: "propertyId", as: "assignedAgents",    onDelete: "CASCADE" });
db.AgentProperty.belongsTo(db.Property, { foreignKey: "propertyId", as: "property" });

db.User.hasMany(db.AgentProperty,     { foreignKey: "assignedById", as: "assignmentsCreated", onDelete: "CASCADE" });
db.AgentProperty.belongsTo(db.User,   { foreignKey: "assignedById", as: "assigner" });

/* ── PropertyReview ────────────────────────────────────────────────────────── */
db.Property.hasMany(db.PropertyReview,   { foreignKey: "propertyId", as: "reviews",        onDelete: "CASCADE" });
db.PropertyReview.belongsTo(db.Property, { foreignKey: "propertyId", as: "property" });

db.User.hasMany(db.PropertyReview,     { foreignKey: "tenantId",   as: "propertyReviews", onDelete: "CASCADE" });
db.PropertyReview.belongsTo(db.User,   { foreignKey: "tenantId",   as: "reviewer" });

/* ── LeaseApplication ──────────────────────────────────────────────────────── */
db.User.hasMany(db.LeaseApplication,     { foreignKey: "tenantId",   as: "myApplications",       onDelete: "CASCADE" });
db.LeaseApplication.belongsTo(db.User,   { foreignKey: "tenantId",   as: "tenant" });

db.User.hasMany(db.LeaseApplication,     { foreignKey: "landlordId", as: "receivedApplications", onDelete: "CASCADE" });
db.LeaseApplication.belongsTo(db.User,   { foreignKey: "landlordId", as: "landlord" });

db.Property.hasMany(db.LeaseApplication,    { foreignKey: "propertyId", as: "applications", onDelete: "CASCADE" });
db.LeaseApplication.belongsTo(db.Property, { foreignKey: "propertyId", as: "property" });

/* ── Agreement ─────────────────────────────────────────────────────────────── */
db.User.hasMany(db.Agreement,     { foreignKey: "landlordId", as: "landlordAgreements", onDelete: "CASCADE" });
db.Agreement.belongsTo(db.User,   { foreignKey: "landlordId", as: "landlord" });

db.User.hasMany(db.Agreement,     { foreignKey: "tenantId",   as: "tenantAgreements",   onDelete: "CASCADE" });
db.Agreement.belongsTo(db.User,   { foreignKey: "tenantId",   as: "tenant" });

db.Property.hasMany(db.Agreement,    { foreignKey: "propertyId", as: "agreements", onDelete: "CASCADE" });
db.Agreement.belongsTo(db.Property, { foreignKey: "propertyId", as: "property" });

db.LeaseApplication.hasOne(db.Agreement,  { foreignKey: "leaseApplicationId", as: "agreement" });
db.Agreement.belongsTo(db.LeaseApplication, { foreignKey: "leaseApplicationId", as: "application" });

/* ── Payment ───────────────────────────────────────────────────────────────── */
db.User.hasMany(db.Payment,     { foreignKey: "tenantId",   as: "tenantPayments",   onDelete: "CASCADE" });
db.Payment.belongsTo(db.User,   { foreignKey: "tenantId",   as: "tenant" });

db.User.hasMany(db.Payment,     { foreignKey: "landlordId", as: "landlordPayments", onDelete: "CASCADE" });
db.Payment.belongsTo(db.User,   { foreignKey: "landlordId", as: "landlord" });

db.Agreement.hasMany(db.Payment,    { foreignKey: "agreementId", as: "payments", onDelete: "CASCADE" });
db.Payment.belongsTo(db.Agreement, { foreignKey: "agreementId", as: "agreement" });

db.Property.hasMany(db.Payment,    { foreignKey: "propertyId", as: "payments", onDelete: "CASCADE" });
db.Payment.belongsTo(db.Property, { foreignKey: "propertyId", as: "property" });

/* ── MaintenanceRequest ────────────────────────────────────────────────────── */
db.Property.hasMany(db.MaintenanceRequest,    { foreignKey: "propertyId",    as: "maintenanceRequests", onDelete: "CASCADE"  });
db.MaintenanceRequest.belongsTo(db.Property, { foreignKey: "propertyId",    as: "property" });

db.User.hasMany(db.MaintenanceRequest,     { foreignKey: "tenantId",       as: "filedMaintenance",    onDelete: "CASCADE"  });
db.MaintenanceRequest.belongsTo(db.User,   { foreignKey: "tenantId",       as: "tenant" });

db.User.hasMany(db.MaintenanceRequest,     { foreignKey: "landlordId",     as: "receivedMaintenance", onDelete: "CASCADE"  });
db.MaintenanceRequest.belongsTo(db.User,   { foreignKey: "landlordId",     as: "landlord" });

db.User.hasMany(db.MaintenanceRequest,     { foreignKey: "assignedAgentId", as: "agentMaintenance",   onDelete: "SET NULL" });
db.MaintenanceRequest.belongsTo(db.User,   { foreignKey: "assignedAgentId", as: "assignedAgent" });

/* ── MaintenanceComment ────────────────────────────────────────────────────── */
db.MaintenanceRequest.hasMany(db.MaintenanceComment,    { foreignKey: "requestId", as: "comments", onDelete: "CASCADE"  });
db.MaintenanceComment.belongsTo(db.MaintenanceRequest, { foreignKey: "requestId", as: "request" });

db.User.hasMany(db.MaintenanceComment,     { foreignKey: "authorId", as: "maintenanceComments", onDelete: "SET NULL" });
db.MaintenanceComment.belongsTo(db.User,   { foreignKey: "authorId", as: "author" });

/* ── Meeting ───────────────────────────────────────────────────────────────── */
db.User.hasMany(db.Meeting,     { foreignKey: "organizerId",   as: "organizedMeetings",     onDelete: "CASCADE" });
db.Meeting.belongsTo(db.User,   { foreignKey: "organizerId",   as: "organizer" });

db.User.hasMany(db.Meeting,     { foreignKey: "participantId", as: "participatingMeetings", onDelete: "CASCADE" });
db.Meeting.belongsTo(db.User,   { foreignKey: "participantId", as: "participant" });

/* ── ViewingRequest ────────────────────────────────────────────────────────── */
db.Property.hasMany(db.ViewingRequest,    { foreignKey: "propertyId",  as: "viewingRequests",        onDelete: "CASCADE" });
db.ViewingRequest.belongsTo(db.Property, { foreignKey: "propertyId",  as: "property" });

db.User.hasMany(db.ViewingRequest,     { foreignKey: "tenantId",   as: "tenantViewingRequests",   onDelete: "CASCADE" });
db.ViewingRequest.belongsTo(db.User,   { foreignKey: "tenantId",   as: "tenant" });

db.User.hasMany(db.ViewingRequest,     { foreignKey: "landlordId", as: "landlordViewingRequests", onDelete: "CASCADE" });
db.ViewingRequest.belongsTo(db.User,   { foreignKey: "landlordId", as: "landlord" });

/* ── Dispute ───────────────────────────────────────────────────────────────── */
db.User.hasMany(db.Dispute,     { foreignKey: "reporterId",   as: "filedDisputes",    onDelete: "CASCADE"  });
db.Dispute.belongsTo(db.User,   { foreignKey: "reporterId",   as: "reporter" });

db.User.hasMany(db.Dispute,     { foreignKey: "respondentId", as: "receivedDisputes", onDelete: "SET NULL" });
db.Dispute.belongsTo(db.User,   { foreignKey: "respondentId", as: "respondent" });

db.User.hasMany(db.Dispute,     { foreignKey: "assignedTo",   as: "assignedDisputes", onDelete: "SET NULL" });
db.Dispute.belongsTo(db.User,   { foreignKey: "assignedTo",   as: "assignedAdmin" });

db.Property.hasMany(db.Dispute,    { foreignKey: "propertyId", as: "disputes",  onDelete: "SET NULL" });
db.Dispute.belongsTo(db.Property, { foreignKey: "propertyId", as: "property" });

db.Dispute.hasMany(db.DisputeMessage,    { foreignKey: "disputeId", as: "messages", onDelete: "CASCADE" });
db.DisputeMessage.belongsTo(db.Dispute, { foreignKey: "disputeId", as: "dispute" });

db.User.hasMany(db.DisputeMessage,     { foreignKey: "senderId", as: "disputeMessages", onDelete: "CASCADE" });
db.DisputeMessage.belongsTo(db.User,   { foreignKey: "senderId", as: "sender" });

db.Dispute.hasMany(db.DisputeEvidence,    { foreignKey: "disputeId",  as: "evidence",        onDelete: "CASCADE" });
db.DisputeEvidence.belongsTo(db.Dispute, { foreignKey: "disputeId",  as: "dispute" });

db.User.hasMany(db.DisputeEvidence,     { foreignKey: "uploadedBy", as: "uploadedEvidence", onDelete: "CASCADE" });
db.DisputeEvidence.belongsTo(db.User,   { foreignKey: "uploadedBy", as: "uploader" });

/* ── Message ───────────────────────────────────────────────────────────────── */
db.User.hasMany(db.Message,     { foreignKey: "senderId",   as: "sentMessages",     onDelete: "CASCADE" });
db.Message.belongsTo(db.User,   { foreignKey: "senderId",   as: "sender" });

db.User.hasMany(db.Message,     { foreignKey: "receiverId", as: "receivedMessages", onDelete: "CASCADE" });
db.Message.belongsTo(db.User,   { foreignKey: "receiverId", as: "receiver" });

/* ── Notification ──────────────────────────────────────────────────────────── */
db.User.hasMany(db.Notification,     { foreignKey: "userId", as: "notifications", onDelete: "CASCADE" });
db.Notification.belongsTo(db.User,   { foreignKey: "userId", as: "user" });

/* ── TrustScoreLog ─────────────────────────────────────────────────────────── */
db.User.hasMany(db.TrustScoreLog,     { foreignKey: "tenantId", as: "trustScoreLogs", onDelete: "CASCADE" });
db.TrustScoreLog.belongsTo(db.User,   { foreignKey: "tenantId", as: "tenant" });

/* ── Favorites ─────────────────────────────────────────────────────────────── */
db.User.hasMany(db.Favorite,     { foreignKey: "userId",      as: "favorites", onDelete: "CASCADE" });
db.Favorite.belongsTo(db.User,   { foreignKey: "userId",      as: "user" });

db.Property.hasMany(db.Favorite,    { foreignKey: "propertyId", as: "favorites", onDelete: "CASCADE" });
db.Favorite.belongsTo(db.Property, { foreignKey: "propertyId", as: "property" });

/* ── News ──────────────────────────────────────────────────────────────────── */
db.User.hasMany(db.NewsPost,     { foreignKey: "authorId", as: "newsPosts", onDelete: "CASCADE" });
db.NewsPost.belongsTo(db.User,   { foreignKey: "authorId", as: "author" });

db.NewsPost.hasMany(db.NewsReaction,    { foreignKey: "newsPostId", as: "reactions", onDelete: "CASCADE" });
db.NewsReaction.belongsTo(db.NewsPost, { foreignKey: "newsPostId", as: "newsPost" });

db.User.hasMany(db.NewsReaction,     { foreignKey: "userId", as: "newsReactions", onDelete: "CASCADE" });
db.NewsReaction.belongsTo(db.User,   { foreignKey: "userId", as: "user" });

db.NewsPost.hasMany(db.NewsComment,    { foreignKey: "newsPostId", as: "comments", onDelete: "CASCADE" });
db.NewsComment.belongsTo(db.NewsPost, { foreignKey: "newsPostId", as: "newsPost" });

db.User.hasMany(db.NewsComment,     { foreignKey: "userId", as: "newsComments", onDelete: "CASCADE" });
db.NewsComment.belongsTo(db.User,   { foreignKey: "userId", as: "user" });

module.exports = db;