// services/trustScoreService.js
// Lazy requires inside every function — avoids circular dependency at startup

const STARTING_SCORE = 100;

// ── Full delta map matching trustScoreLog model ENUM ─────────────────────────
const DELTA_MAP = {
  account_created:       0,   // baseline — no change
  on_time_payment:      +2,
  id_verified:          +10,
  lease_signed:         +5,
  lease_completed:      +5,
  streak_3_months:      +3,
  streak_6_months:      +8,
  streak_12_months:     +15,
  dispute_won:          +5,
  guarantor_added:      +3,
  late_payment:         -5,
  missed_payment:       -10,
  dispute_filed_against:-5,
  dispute_lost:         -15,
  report_filed:         -10,
  lease_broken:         -20,
  id_rejected:          -5,
};

// ── Lazy model loader ─────────────────────────────────────────────────────────
function getModels() {
  const db = require("../model");
  return {
    TrustScoreLog: db.TrustScoreLog,
    TenantProfile: db.TenantProfile,
  };
}

// ── Get current score ─────────────────────────────────────────────────────────
async function getScore(tenantId) {
  const { TrustScoreLog } = getModels();
  const logs = await TrustScoreLog.findAll({ where: { tenantId } });

  if (logs.length === 0) return STARTING_SCORE;

  // Use the latest snapshotAfter for accuracy
  const sorted = [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return Math.max(0, Math.min(sorted[0].snapshotAfter, 1000));
}

// ── Add a score event ─────────────────────────────────────────────────────────
async function addEvent({ tenantId, reason, referenceId = null, referenceType = null, note = null }) {
  const { TrustScoreLog, TenantProfile } = getModels();

  const delta = DELTA_MAP[reason];
  if (delta === undefined) throw new Error(`Unknown trust score reason: "${reason}"`);

  const currentScore  = await getScore(tenantId);
  const snapshotAfter = Math.max(0, Math.min(currentScore + delta, 1000));

  await TrustScoreLog.create({
    tenantId,
    delta,
    reason,
    referenceId,
    referenceType,
    snapshotAfter,
    note,
  });

  // Keep TenantProfile.trustScore in sync for quick reads
  await TenantProfile.update(
    { trustScore: snapshotAfter },
    { where: { userId: tenantId } }
  );

  return snapshotAfter;
}

// ── Initialize score for new tenant ──────────────────────────────────────────
async function initializeScore(tenantId) {
  const { TrustScoreLog } = getModels();

  // Avoid double-init
  const existing = await TrustScoreLog.findOne({ where: { tenantId } });
  if (existing) return;

  return addEvent({
    tenantId,
    reason: "account_created",
    note:   "Account created — starting score 100",
  });
}

// ── Get history (last N events) ───────────────────────────────────────────────
async function getHistory(tenantId, { limit = 100 } = {}) {
  const { TrustScoreLog } = getModels();
  return TrustScoreLog.findAll({
    where:  { tenantId },
    order:  [["createdAt", "DESC"]],
    limit,
  });
}

// ── Get monthly history for chart (last N months) ─────────────────────────────
async function getMonthlyHistory(tenantId, months = 6) {
  const { TrustScoreLog } = getModels();
  const { Op } = require("sequelize");

  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const logs = await TrustScoreLog.findAll({
    where: {
      tenantId,
      createdAt: { [Op.gte]: since },
    },
    order: [["createdAt", "ASC"]],
  });

  // Build month buckets: { month: "Jan", score: N }
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const buckets    = {};

  // Seed all month slots with null
  for (let i = months - 1; i >= 0; i--) {
    const d   = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets[key] = {
      month:  monthNames[d.getMonth()],
      score:  null,
      year:   d.getFullYear(),
      monthN: d.getMonth(),
    };
  }

  // Fill in the last known snapshotAfter for each month
  logs.forEach(log => {
    const d   = new Date(log.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (buckets[key] !== undefined) {
      buckets[key].score = log.snapshotAfter;
    }
  });

  // Forward-fill nulls with last known value
  const result = Object.values(buckets);
  let lastKnown = STARTING_SCORE;
  result.forEach(b => {
    if (b.score !== null) lastKnown = b.score;
    else b.score = lastKnown;
  });

  return result.map(b => ({ month: b.month, score: b.score }));
}

module.exports = {
  getScore,
  addEvent,
  initializeScore,
  getHistory,
  getMonthlyHistory,
  DELTA_MAP,
  STARTING_SCORE,
};