// services/trustScoreService.js
// Uses lazy requires inside functions to avoid circular dependency at load time

const DELTA_MAP = {
  account_created:  0,
  on_time_payment: +2,
  id_verified:     +10,
  lease_completed: +5,
  streak_6_months: +8,
  late_payment:     -5,
  report_filed:     -10,
  dispute_lost:     -15,
  lease_broken:     -20,
};

const STARTING_SCORE = 100;

// Lazy-load models inside each function — avoids circular require on startup
function getModels() {
  const db = require("../model");
  return { TrustScoreLog: db.TrustScoreLog, TenantProfile: db.TenantProfile };
}

async function getScore(tenantId) {
  const { TrustScoreLog } = getModels();
  const logs = await TrustScoreLog.findAll({ where: { tenantId } });
  // Calculates score based on starting point + all log deltas
  const total = logs.reduce((sum, l) => sum + l.delta, STARTING_SCORE);
  // Constraints score between 0 and 1000
  return Math.max(0, Math.min(total, 1000));
}

async function addEvent({ tenantId, reason, referenceId = null, referenceType = null, note = null }) {
  const { TrustScoreLog, TenantProfile } = getModels();

  const delta = DELTA_MAP[reason];
  if (delta === undefined) throw new Error(`Unknown trust score reason: ${reason}`);

  const currentScore   = await getScore(tenantId);
  const snapshotAfter  = Math.max(0, Math.min(currentScore + delta, 1000));

  await TrustScoreLog.create({
    tenantId, 
    delta, 
    reason, 
    referenceId, 
    referenceType, 
    snapshotAfter, 
    note,
  });

  // Keep TenantProfile.trustScore in sync for quick reads in other parts of the app
  await TenantProfile.update(
    { trustScore: snapshotAfter },
    { where: { userId: tenantId } }
  );

  return snapshotAfter;
}

async function initializeScore(tenantId) {
  return addEvent({ tenantId, reason: "account_created", note: "Account created" });
}

async function getHistory(tenantId) {
  const { TrustScoreLog } = getModels();
  return TrustScoreLog.findAll({
    where: { tenantId },
    order: [["createdAt", "DESC"]],
  });
}

module.exports = { getScore, addEvent, initializeScore, getHistory };