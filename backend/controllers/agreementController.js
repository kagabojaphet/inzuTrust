// controllers/agreementController.js
const notificationService = require("../services/notificationService");
const trustScoreService   = require("../services/trustScoreService");

const getDb = () => require("../model");

const genDocId = () => `RW-${Math.floor(1000 + Math.random() * 9000)}-KGL`;

// POST /api/agreements
const create = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const data = req.body;

    const agreement = await getDb().Agreement.create({
      ...data,
      landlordId,
      docId: data.docId || genDocId(),
      landlordSigned: !!data.landlordSignature,
      status: data.landlordSignature && data.tenantSignature ? "signed" : "pending_signature",
      signedAt: data.landlordSignature && data.tenantSignature ? new Date() : null,
    });

    if (data.tenantId) {
      await notificationService.send({
        userId: data.tenantId,
        type: "lease_pending",
        title: "Lease Agreement Ready",
        message: `Your landlord has created a lease agreement for ${data.propertyAddress}. Please review and sign.`,
        referenceId: agreement.id, referenceType: "Agreement",
      });
    }

    return res.status(201).json({ success: true, message: "Agreement created", data: agreement });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/agreements  (landlord)
const getLandlordAgreements = async (req, res) => {
  try {
    const { Agreement, User, Property } = getDb(); // ← FIX: was missing this line
    const agreements = await Agreement.findAll({
      where: { landlordId: req.user.id },
      include: [
        { model: User,     as: "tenant",   attributes: ["firstName", "lastName", "email"] },
        { model: Property, as: "property", attributes: ["title", "district", "mainImage", "rentAmount"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.json({ success: true, data: agreements });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/agreements/my  (tenant)
const getTenantAgreements = async (req, res) => {
  try {
    const { Agreement, User, Property } = getDb(); // ← FIX: was missing this line
    const agreements = await Agreement.findAll({
      where: { tenantId: req.user.id },
      include: [
        { model: User,     as: "landlord", attributes: ["firstName", "lastName", "email"] },
        { model: Property, as: "property", attributes: ["title", "district", "mainImage", "rentAmount"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.json({ success: true, data: agreements });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/agreements/:id
const getById = async (req, res) => {
  try {
    const { Agreement, User, Property } = getDb(); // ← FIX: was missing this line
    const agreement = await Agreement.findByPk(req.params.id, {
      include: [
        { model: User,     as: "landlord", attributes: ["firstName", "lastName", "email"] },
        { model: User,     as: "tenant",   attributes: ["firstName", "lastName", "email"] },
        { model: Property, as: "property" },
      ],
    });
    if (!agreement) return res.status(404).json({ success: false, message: "Agreement not found" });
    if (agreement.landlordId !== req.user.id && agreement.tenantId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    return res.json({ success: true, data: agreement });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/agreements/:id/sign  (tenant signs)
const sign = async (req, res) => {
  try {
    const { tenantSignature, tenantName, signedAt } = req.body;
    const agreement = await getDb().Agreement.findOne({
      where: { id: req.params.id, tenantId: req.user.id },
    });
    if (!agreement) return res.status(404).json({ success: false, message: "Agreement not found" });
    if (agreement.tenantSigned) return res.status(400).json({ success: false, message: "Already signed" });

    const bothSigned = agreement.landlordSigned && !!tenantSignature;
    await agreement.update({
      tenantSignature,
      tenantSigned: true,
      status:   bothSigned ? "signed"              : "pending_signature",
      signedAt: bothSigned ? (signedAt || new Date()) : null,
    });

    if (bothSigned) {
      await trustScoreService.addEvent({
        tenantId: req.user.id, reason: "lease_completed",
        referenceId: agreement.id, referenceType: "Agreement",
        note: "Lease agreement signed",
      });
      await notificationService.send({
        userId: agreement.landlordId,
        type: "lease_signed",
        title: "Lease Agreement Signed",
        message: `${tenantName || "Tenant"} has signed the lease agreement for ${agreement.propertyAddress}.`,
        referenceId: agreement.id, referenceType: "Agreement",
      });
    }

    return res.json({ success: true, message: "Agreement signed", data: agreement });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { create, getLandlordAgreements, getTenantAgreements, getById, sign };