// services/listingAgreementService.js
// Called when landlord/agent clicks "Accept & Continue" on the listing agreement screen.

const { User, LandlordProfile, AgentProfile } = require("../model");
const badgeService = require("./badgeService");

// The 8 terms shown in the image — stored so we can audit which version was agreed to
const AGREEMENT_VERSION = "1.0.0";
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

// POST /api/listing-agreement/accept
const acceptAgreement = async (userId, { acceptedTerms }) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  if (!["landlord", "agent"].includes(user.role)) {
    throw new Error("Only landlords and agents need to accept the listing agreement");
  }

  if (user.hasAcceptedListingAgreement) {
    return { alreadyAccepted: true, acceptedAt: user.listingAgreementAcceptedAt };
  }

  // Verify all 8 terms were checked
  const missing = REQUIRED_TERMS.filter((t) => !acceptedTerms?.includes(t));
  if (missing.length > 0) {
    throw new Error(`Please accept all terms. Missing: ${missing.join(", ")}`);
  }

  const now = new Date();

  await user.update({
    hasAcceptedListingAgreement: true,
    listingAgreementAcceptedAt:  now,
  });

  // Mirror on role profile for quick joins
  if (user.role === "landlord") {
    await LandlordProfile.update(
      { agreedToTerms: true, agreedToTermsAt: now },
      { where: { userId } }
    );
  }

  // Check if this triggers any badges
  await badgeService.checkLandlordBadges(userId);

  return {
    accepted:   true,
    acceptedAt: now,
    version:    AGREEMENT_VERSION,
  };
};

// GET /api/listing-agreement/status
const getAgreementStatus = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["hasAcceptedListingAgreement", "listingAgreementAcceptedAt", "role"],
  });
  if (!user) throw new Error("User not found");

  return {
    hasAccepted: user.hasAcceptedListingAgreement,
    acceptedAt:  user.listingAgreementAcceptedAt,
    version:     AGREEMENT_VERSION,
    requiredTerms: REQUIRED_TERMS,
  };
};

module.exports = { acceptAgreement, getAgreementStatus, REQUIRED_TERMS, AGREEMENT_VERSION };