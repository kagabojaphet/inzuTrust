// controllers/trustScoreController.js
const trustScoreService = require("../services/trustScoreService");

// GET /api/trust-score  (tenant — their own score + history)
const getMy = async (req, res) => {
  try {
    const tenantId = req.user.id;
    // Lazy-load to avoid potential circular dependency issues with index.js
    const { TenantProfile } = require("../model");

    const [score, history, profile] = await Promise.all([
      trustScoreService.getScore(tenantId),
      trustScoreService.getHistory(tenantId),
      TenantProfile.findOne({ where: { userId: tenantId } }),
    ]);

    const breakdown = {
      positive: history.filter(l => l.delta > 0).reduce((s, l) => s + l.delta, 0),
      negative: history.filter(l => l.delta < 0).reduce((s, l) => s + l.delta, 0),
      total: score,
    };

    const categories = {};
    history.forEach(l => {
      categories[l.reason] = (categories[l.reason] || 0) + l.delta;
    });

    return res.json({
      success: true,
      data: { score, breakdown, categories, history, profile: profile || null },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/trust-score/:tenantId  (admin)
const getByTenant = async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const [score, history] = await Promise.all([
      trustScoreService.getScore(tenantId),
      trustScoreService.getHistory(tenantId),
    ]);
    return res.json({ success: true, data: { score, history } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMy, getByTenant };