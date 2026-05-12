// controllers/platformAgreementController.js
const service = require("../services/platformAgreementService");
const audit   = () => require("../services/auditLogService");

const safe = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/platform-agreement/sign
// Landlord or Agent signs the agreement
const signAgreement = safe(async (req, res) => {
  const result = await service.signAgreement(req.user.id, {
    acceptedTerms: req.body.acceptedTerms,
    userSignature: req.body.userSignature,
    signedFromIp:  req.ip,
  });

  audit().log.info({
    actorId:   req.user.id,
    actorName: `${req.user.firstName} ${req.user.lastName}`,
    actorRole: req.user.role,
    action:    result.alreadySigned
      ? "Platform agreement already signed"
      : "Platform agreement signed",
    target:   req.user.email,
    sourceIp: req.ip,
  });

  return res.status(result.alreadySigned ? 200 : 201).json({
    success: true,
    message: result.alreadySigned
      ? "You have already signed this agreement."
      : "Agreement signed successfully. Awaiting admin countersignature.",
    data: result,
  });
});

// GET /api/platform-agreement/status
const getStatus = safe(async (req, res) => {
  const status = await service.getUserAgreementStatus(req.user.id);
  return res.json({ success: true, data: status });
});

// GET /api/platform-agreement/pending  (admin)
const getPending = safe(async (req, res) => {
  const list = await service.getPendingAgreements();
  return res.json({ success: true, count: list.length, data: list });
});

// GET /api/platform-agreement/all  (admin)
const getAll = safe(async (req, res) => {
  const { status, role } = req.query;
  const list = await service.getAllAgreements({ status, role });
  return res.json({ success: true, count: list.length, data: list });
});

// PATCH /api/platform-agreement/:id/countersign  (admin)
const countersign = safe(async (req, res) => {
  const agreement = await service.countersignAgreement(req.user.id, req.params.id);

  audit().log.success({
    actorId:   req.user.id,
    actorName: `${req.user.firstName} ${req.user.lastName}`,
    actorRole: req.user.role,
    action:    `Countersigned platform agreement ${req.params.id}`,
    target:    agreement.userId,
    sourceIp:  req.ip,
  });

  return res.json({
    success: true,
    message: "Agreement countersigned and now active.",
    data:    agreement,
  });
});

// PATCH /api/platform-agreement/:id/revoke  (admin)
const revoke = safe(async (req, res) => {
  const agreement = await service.revokeAgreement(
    req.user.id,
    req.params.id,
    req.body.reason
  );

  audit().log.warning({
    actorId:   req.user.id,
    actorName: `${req.user.firstName} ${req.user.lastName}`,
    actorRole: req.user.role,
    action:    `Revoked platform agreement ${req.params.id}`,
    target:    agreement.userId,
    sourceIp:  req.ip,
  });

  return res.json({
    success: true,
    message: "Agreement revoked.",
    data:    agreement,
  });
});

module.exports = { signAgreement, getStatus, getPending, getAll, countersign, revoke };