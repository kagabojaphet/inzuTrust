// services/profileCompletionService.js
const { User, TenantProfile, LandlordProfile, AgentProfile } = require("../model");
const badgeService = require("./badgeService");

// ── Per-role required fields for 100% completion ──────────────────────────────
const TENANT_FIELDS = [
  { label: "Profile Picture",  check: (u)  => !!u.profilePicture },
  { label: "Phone Number",     check: (u)  => !!u.phone },
  { label: "National ID",      check: (u)  => !!u.nationalId },
  { label: "ID Verified",      check: (p)  => p.idVerified },
  { label: "Occupation",       check: (p)  => !!p.occupation },
  { label: "Monthly Income",   check: (p)  => !!p.monthlyIncome },
  { label: "Current Address",  check: (p)  => !!p.currentAddress },
  { label: "MoMo Number",      check: (p)  => !!p.momoNumber },
  { label: "Bio",              check: (p)  => !!p.bio },
  { label: "Email Verified",   check: (u)  => u.isEmailVerified },
];

const LANDLORD_FIELDS = [
  { label: "Profile Picture",      check: (u) => !!u.profilePicture },
  { label: "Phone Number",         check: (u) => !!u.phone },
  { label: "Landlord ID",          check: (u) => !!u.landlordId },
  { label: "National ID",          check: (u) => !!u.nationalId },
  { label: "ID Verified",          check: (p) => p.idVerified },
  { label: "Business Address",     check: (p) => !!p.businessAddress },
  { label: "TIN Number",           check: (p) => !!p.tinNumber },
  { label: "Listing Agreement",    check: (u) => u.hasAcceptedListingAgreement },
  { label: "Email Verified",       check: (u) => u.isEmailVerified },
  { label: "Bio",                  check: (p) => !!p.bio },
];

const AGENT_FIELDS = [
  { label: "Profile Picture",     check: (u) => !!u.profilePicture },
  { label: "Phone Number",        check: (u) => !!u.phone },
  { label: "National ID",         check: (u) => !!u.nationalId },
  { label: "License Number",      check: (p) => !!p.licenseNumber },
  { label: "Agency Name",         check: (p) => !!p.agencyName },
  { label: "ID Verified",         check: (p) => p.idVerified },
  { label: "License Verified",    check: (p) => p.idVerified },
  { label: "Years Experience",    check: (p) => !!p.yearsExperience },
  { label: "Listing Agreement",   check: (u) => u.hasAcceptedListingAgreement },
  { label: "Email Verified",      check: (u) => u.isEmailVerified },
];

const computeCompletion = (fields, user, profile) => {
  const results = fields.map((f) => {
    try {
      // Try user first, then profile
      const fromUser    = f.check(user);
      const fromProfile = profile ? f.check(profile) : false;
      return { label: f.label, done: !!(fromUser || fromProfile) };
    } catch {
      return { label: f.label, done: false };
    }
  });

  const done       = results.filter((r) => r.done).length;
  const percentage = Math.round((done / results.length) * 100);
  const missing    = results.filter((r) => !r.done).map((r) => r.label);

  return { percentage, missing, total: results.length, completed: done };
};

// ── Main export: compute + persist completion % ───────────────────────────────
const updateProfileCompletion = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  let profile = null;
  let fields  = [];

  if (user.role === "tenant") {
    profile = await TenantProfile.findOne({ where: { userId } });
    fields  = TENANT_FIELDS;
  } else if (user.role === "landlord") {
    profile = await LandlordProfile.findOne({ where: { userId } });
    fields  = LANDLORD_FIELDS;
  } else if (user.role === "agent") {
    profile = await AgentProfile.findOne({ where: { userId } });
    fields  = AGENT_FIELDS;
  } else {
    return { percentage: 100, missing: [], total: 0, completed: 0 };
  }

  const result = computeCompletion(fields, user.toJSON(), profile ? profile.toJSON() : null);

  // Persist percentage on user record
  await user.update({ profileCompletion: result.percentage });

  // Check badges after completion update
  if (user.role === "tenant")   await badgeService.checkTenantBadges(userId);
  if (user.role === "landlord") await badgeService.checkLandlordBadges(userId);
  if (user.role === "agent")    await badgeService.checkAgentBadges(userId);

  return result;
};

module.exports = { updateProfileCompletion, TENANT_FIELDS, LANDLORD_FIELDS, AGENT_FIELDS };