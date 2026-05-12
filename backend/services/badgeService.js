// services/badgeService.js
// Badges are awarded automatically based on milestones.
// Call the relevant check after the triggering event completes.

const { User, TenantProfile, LandlordProfile, AgentProfile } = require("../model");

// ── Badge definitions ─────────────────────────────────────────────────────────
const BADGES = {
  // Tenant badges
  VERIFIED_TENANT:   "verified_tenant",    // KYC verified
  ON_TIME_PAYER:     "on_time_payer",      // 6+ consecutive on-time payments
  LONG_TERM_TENANT:  "long_term_tenant",   // active lease > 12 months
  TRUSTED_TENANT:    "trusted_tenant",     // trustScore >= 90
  DISPUTE_FREE:      "dispute_free",       // 0 disputes filed against them

  // Landlord badges
  VERIFIED_LANDLORD: "verified_landlord",  // KYC + landlordId verified by admin
  TOP_LANDLORD:      "top_landlord",       // avg property rating >= 4.5
  RESPONSIVE_LANDLORD: "responsive_landlord", // replies within 24h (future)
  LONG_TERM_HOST:    "long_term_host",     // listed on platform > 12 months

  // Agent badges
  VERIFIED_AGENT:    "verified_agent",     // license + KYC verified by admin
  TOP_AGENT:         "top_agent",          // 10+ active listings
  TRUSTED_AGENT:     "trusted_agent",      // assigned by 3+ landlords
  EXPERIENCED_AGENT: "experienced_agent",  // 5+ years experience on profile
};

// ── Internal: add badge if not already present ────────────────────────────────
const awardBadge = async (userId, badge) => {
  const user = await User.findByPk(userId);
  if (!user) return;

  const current = Array.isArray(user.badges) ? user.badges : [];
  if (current.includes(badge)) return; // already has it

  await user.update({ badges: [...current, badge] });
};

const removeBadge = async (userId, badge) => {
  const user = await User.findByPk(userId);
  if (!user) return;

  const current = Array.isArray(user.badges) ? user.badges : [];
  await user.update({ badges: current.filter((b) => b !== badge) });
};

// ── Tenant badge checks ───────────────────────────────────────────────────────
const checkTenantBadges = async (userId) => {
  const profile = await TenantProfile.findOne({ where: { userId } });
  if (!profile) return;

  // verified_tenant — admin marked KYC complete
  if (profile.idVerified) {
    await awardBadge(userId, BADGES.VERIFIED_TENANT);
  }

  // trusted_tenant — trustScore >= 90
  if (profile.trustScore >= 90) {
    await awardBadge(userId, BADGES.TRUSTED_TENANT);
  } else {
    await removeBadge(userId, BADGES.TRUSTED_TENANT);
  }

  // on_time_payer — 6+ payments, zero late
  if (profile.totalPayments >= 6 && profile.latePayments === 0) {
    await awardBadge(userId, BADGES.ON_TIME_PAYER);
  }

  // dispute_free — no disputes on record (caller must pass flag)
  // Checked separately via checkDisputeFreeBadge()
};

// Call after each payment recorded
const checkOnTimePayerBadge = async (userId) => {
  const profile = await TenantProfile.findOne({ where: { userId } });
  if (!profile) return;
  if (profile.totalPayments >= 6 && profile.latePayments === 0) {
    await awardBadge(userId, BADGES.ON_TIME_PAYER);
  }
};

// Call after dispute resolution
const checkDisputeFreeBadge = async (userId, hasDisputes) => {
  if (!hasDisputes) {
    await awardBadge(userId, BADGES.DISPUTE_FREE);
  } else {
    await removeBadge(userId, BADGES.DISPUTE_FREE);
  }
};

// ── Landlord badge checks ─────────────────────────────────────────────────────
const checkLandlordBadges = async (userId) => {
  const profile = await LandlordProfile.findOne({ where: { userId } });
  const user    = await User.findByPk(userId);
  if (!profile || !user) return;

  // verified_landlord — admin verified KYC + landlordId
  if (user.isVerified && profile.idVerified) {
    await awardBadge(userId, BADGES.VERIFIED_LANDLORD);
  }

  // long_term_host — account older than 12 months
  const monthsOnPlatform =
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (monthsOnPlatform >= 12) {
    await awardBadge(userId, BADGES.LONG_TERM_HOST);
  }

  // top_landlord — based on property ratings (caller computes avg and passes)
};

// Call after property review recalculation
const checkTopLandlordBadge = async (userId, avgRating) => {
  if (avgRating >= 4.5) {
    await awardBadge(userId, BADGES.TOP_LANDLORD);
  } else {
    await removeBadge(userId, BADGES.TOP_LANDLORD);
  }
};

// ── Agent badge checks ────────────────────────────────────────────────────────
const checkAgentBadges = async (userId) => {
  const profile = await AgentProfile.findOne({ where: { userId } });
  const user    = await User.findByPk(userId);
  if (!profile || !user) return;

  // verified_agent — admin verified license + KYC
  if (user.isVerified && profile.idVerified) {
    await awardBadge(userId, BADGES.VERIFIED_AGENT);
  }

  // top_agent — 10+ active listings
  if (profile.activeListings >= 10) {
    await awardBadge(userId, BADGES.TOP_AGENT);
  }

  // trusted_agent — assigned by 3+ different landlords
  if (profile.totalAssignments >= 3) {
    await awardBadge(userId, BADGES.TRUSTED_AGENT);
  }

  // experienced_agent — 5+ years on profile
  if (profile.yearsExperience >= 5) {
    await awardBadge(userId, BADGES.EXPERIENCED_AGENT);
  }
};

module.exports = {
  BADGES,
  awardBadge,
  removeBadge,
  checkTenantBadges,
  checkOnTimePayerBadge,
  checkDisputeFreeBadge,
  checkLandlordBadges,
  checkTopLandlordBadge,
  checkAgentBadges,
};