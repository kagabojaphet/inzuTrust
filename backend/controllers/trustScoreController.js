// controllers/trustScoreController.js
// Uses lazy require inside functions — avoids circular dependency at startup

// ── Lazy loader — call inside each function, not at module level ──────────────
const getService = () => require("../services/trustScoreService");

// ── GET /api/trust-score  (tenant — their own score + full dashboard data) ────
const getMy = async (req, res) => {
  try {
    const trustScoreService   = getService();
    const { TenantProfile }   = require("../model");
    const tenantId            = req.user.id;

    const [score, history, monthlyHistory, profile] = await Promise.all([
      trustScoreService.getScore(tenantId),
      trustScoreService.getHistory(tenantId, { limit: 100 }),
      trustScoreService.getMonthlyHistory(tenantId, 6),
      TenantProfile.findOne({ where: { userId: tenantId } }),
    ]);

    // ── Breakdown calculations ────────────────────────────────────────────────
    const positive = history.filter(l => l.delta > 0).reduce((s, l) => s + l.delta, 0);
    const negative = history.filter(l => l.delta < 0).reduce((s, l) => s + l.delta, 0);

    const categories = {};
    history.forEach(l => {
      if (!categories[l.reason]) categories[l.reason] = { count: 0, totalDelta: 0 };
      categories[l.reason].count++;
      categories[l.reason].totalDelta += l.delta;
    });

    const onTimeCount   = history.filter(l => l.reason === "on_time_payment").length;
    const lateCount     = history.filter(l =>
      l.reason === "late_payment" || l.reason === "missed_payment"
    ).length;
    const disputeCount  = history.filter(l =>
      l.reason === "dispute_filed_against" || l.reason === "dispute_lost"
    ).length;
    const totalPayments = onTimeCount + lateCount;
    const onTimeRate    = totalPayments > 0
      ? `${Math.round((onTimeCount / totalPayments) * 100)}%`
      : "100%";

    const leaseEvents      = history.filter(l =>
      l.reason === "lease_completed" || l.reason === "lease_signed"
    );
    const avgAgreementText = leaseEvents.length > 0
      ? `${(leaseEvents.length * 0.6).toFixed(1)} Yrs`
      : "New";

    const now     = new Date();
    const changeThisMonth = history
      .filter(l => {
        const d = new Date(l.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, l) => s + l.delta, 0);

    return res.json({
      success: true,
      data: {
        score,
        monthlyHistory,
        breakdown: {
          positive,
          negative,
          total:          score,
          onTimeRate,
          latePayments:   lateCount,
          disputes:       disputeCount,
          avgAgreement:   avgAgreementText,
          changeThisMonth,
          totalEvents:    history.length,
        },
        categories,
        history:    history.slice(0, 20), // last 20 events for the table
        profile:    profile || null,
        isVerified: profile?.isVerified ?? req.user.isVerified ?? false,
      },
    });
  } catch (err) {
    console.error("[TrustScoreController] getMy error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/trust-score/admin/:tenantId  (admin only) ────────────────────────
const getByTenant = async (req, res) => {
  try {
    const trustScoreService = getService();
    const tenantId          = req.params.tenantId;

    const [score, history, monthlyHistory] = await Promise.all([
      trustScoreService.getScore(tenantId),
      trustScoreService.getHistory(tenantId),
      trustScoreService.getMonthlyHistory(tenantId, 12),
    ]);

    return res.json({ success: true, data: { score, history, monthlyHistory } });
  } catch (err) {
    console.error("[TrustScoreController] getByTenant error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMy, getByTenant };