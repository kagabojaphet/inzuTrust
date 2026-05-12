// services/platformAgreementService.js
const { PlatformAgreement, User } = require("../model");
const badgeService = require("./badgeService");

const CURRENT_VERSION = "1.0.0";

const REQUIRED_TERMS = [
  "accurateInformation",
  "ownershipOrAuthorization",
  "noFraudOrMisleadingListings",
  "verificationConsent",
  "platformPolicies",
  "feesAndCommission",
  "policyEnforcement",
  "platformRole",
];

// ── User signs the platform agreement ────────────────────────────────────────
const signAgreement = async (userId, { acceptedTerms, userSignature, signedFromIp }) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  if (!["landlord", "agent"].includes(user.role)) {
    throw new Error("Only landlords and agents sign platform agreements");
  }

  // Check all 8 terms accepted
  const missing = REQUIRED_TERMS.filter((t) => !acceptedTerms?.includes(t));
  if (missing.length > 0) {
    throw new Error(`Missing required terms: ${missing.join(", ")}`);
  }

  // Check if already signed this version
  const existing = await PlatformAgreement.findOne({
    where: { userId, agreementVersion: CURRENT_VERSION },
  });
  if (existing) {
    return {
      alreadySigned: true,
      status:        existing.status,
      signedAt:      existing.signedAt,
      agreement:     existing,
    };
  }

  const agreement = await PlatformAgreement.create({
    userId,
    userRole:         user.role,
    agreementVersion: CURRENT_VERSION,
    acceptedTerms,
    userSignature:    userSignature || null,
    signedFromIp:     signedFromIp  || null,
    signedAt:         new Date(),
    status:           "pending",
  });

  // Also mark on user record for quick checks
  await user.update({
    hasAcceptedListingAgreement: true,
    listingAgreementAcceptedAt:  new Date(),
  });

  return { alreadySigned: false, agreement };
};

// ── Admin countersigns (approves) ─────────────────────────────────────────────
const countersignAgreement = async (adminId, agreementId) => {
  const admin = await User.findByPk(adminId);
  if (!admin || admin.role !== "admin") throw new Error("Only admins can countersign");

  const agreement = await PlatformAgreement.findByPk(agreementId);
  if (!agreement) throw new Error("Agreement not found");

  if (agreement.status !== "pending") {
    throw new Error(`Agreement is already ${agreement.status}`);
  }

  await agreement.update({
    status:            "active",
    countersignedBy:   adminId,
    countersignedAt:   new Date(),
    platformSignature: `InzuTrust — Countersigned by ${admin.firstName} ${admin.lastName}`,
  });

  // Award verified badge to the signer
  const signer = await User.findByPk(agreement.userId);
  if (signer?.role === "landlord") await badgeService.checkLandlordBadges(signer.id);
  if (signer?.role === "agent")    await badgeService.checkAgentBadges(signer.id);

  return agreement;
};

// ── Admin revokes an agreement ────────────────────────────────────────────────
const revokeAgreement = async (adminId, agreementId, reason) => {
  const admin = await User.findByPk(adminId);
  if (!admin || admin.role !== "admin") throw new Error("Only admins can revoke");

  const agreement = await PlatformAgreement.findByPk(agreementId);
  if (!agreement) throw new Error("Agreement not found");

  await agreement.update({
    status:           "revoked",
    revocationReason: reason || "Revoked by admin",
  });

  // Remove listing agreement flag from user
  await User.update(
    { hasAcceptedListingAgreement: false, listingAgreementAcceptedAt: null },
    { where: { id: agreement.userId } }
  );

  return agreement;
};

// ── Get agreement status for a user ──────────────────────────────────────────
const getUserAgreementStatus = async (userId) => {
  const agreement = await PlatformAgreement.findOne({
    where:   { userId, agreementVersion: CURRENT_VERSION },
    include: [
      { model: User, as: "adminCountersigner",
        attributes: ["id", "firstName", "lastName"], required: false },
    ],
  });

  return {
    hasSigned:       !!agreement,
    status:          agreement?.status       || null,
    signedAt:        agreement?.signedAt     || null,
    countersignedAt: agreement?.countersignedAt || null,
    version:         CURRENT_VERSION,
    requiredTerms:   REQUIRED_TERMS,
    agreement:       agreement || null,
  };
};

// ── Admin: get all pending agreements ────────────────────────────────────────
const getPendingAgreements = async () => {
  return PlatformAgreement.findAll({
    where:   { status: "pending" },
    include: [
      { model: User, as: "signer",
        attributes: ["id", "firstName", "lastName", "email", "role"] },
    ],
    order: [["createdAt", "ASC"]],
  });
};

// ── Admin: get all agreements ─────────────────────────────────────────────────
const getAllAgreements = async ({ status, role } = {}) => {
  const where = {};
  if (status) where.status   = status;
  if (role)   where.userRole = role;

  return PlatformAgreement.findAll({
    where,
    include: [
      { model: User, as: "signer",
        attributes: ["id", "firstName", "lastName", "email", "role"] },
      { model: User, as: "adminCountersigner",
        attributes: ["id", "firstName", "lastName"], required: false },
    ],
    order: [["createdAt", "DESC"]],
  });
};

module.exports = {
  CURRENT_VERSION,
  REQUIRED_TERMS,
  signAgreement,
  countersignAgreement,
  revokeAgreement,
  getUserAgreementStatus,
  getPendingAgreements,
  getAllAgreements,
};