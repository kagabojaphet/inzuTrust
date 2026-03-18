// controllers/agreementController.js
const notificationService = require("../services/notificationService");
const trustScoreService   = require("../services/trustScoreService");

// Lazy-load DB to avoid circular require on startup
const getDb = () => require("../model");


const genDocId = () => `RW-${Math.floor(1000 + Math.random() * 9000)}-KGL`;

// POST /api/agreements  (landlord creates + signs)
const create = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const data = req.body;

    // ── 1. Validate required fields ──────────────────────────────────────────
    if (!data.propertyId) {
      return res.status(400).json({ success: false, message: "propertyId is required" });
    }
    if (!data.tenantId) {
      return res.status(400).json({ success: false, message: "tenantId is required" });
    }
    if (!data.rentAmount) {
      return res.status(400).json({ success: false, message: "rentAmount is required" });
    }

    // ── 2. Verify property exists in DB ──────────────────────────────────────
    const { Property, User } = getDb();
    const property = await Property.findByPk(data.propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: `Property not found. The propertyId "${data.propertyId}" does not exist in the database. Use GET /api/properties/my/list to find your valid property IDs.`,
      });
    }

    // ── 3. Verify property belongs to this landlord ──────────────────────────
    if (property.landlordId !== landlordId) {
      return res.status(403).json({
        success: false,
        message: "This property does not belong to your account.",
      });
    }

    // ── 4. Verify tenant exists ──────────────────────────────────────────────
    const tenant = await User.findByPk(data.tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: `Tenant not found. The tenantId "${data.tenantId}" does not exist.`,
      });
    }

    // ── 5. Create agreement ──────────────────────────────────────────────────
    const { Agreement } = getDb();
    const agreement = await Agreement.create({
      ...data,
      landlordId,
      docId: data.docId || genDocId(),
      landlordSigned: !!data.landlordSignature,
      status: data.landlordSignature && data.tenantSignature ? "signed" : "pending_signature",
      signedAt: data.landlordSignature && data.tenantSignature ? new Date() : null,
    });

    // ── 6. Notify tenant ─────────────────────────────────────────────────────
    await notificationService.send({
      userId: data.tenantId,
      type: "lease_pending",
      title: "Lease Agreement Ready",
      message: `Your landlord has created a lease agreement for ${data.propertyAddress || property.title}. Please review and sign in your dashboard.`,
      referenceId: agreement.id,
      referenceType: "Agreement",
    });

    return res.status(201).json({ success: true, message: "Agreement created", data: agreement });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/agreements  (landlord — their agreements)
const getLandlordAgreements = async (req, res) => {
  try {
    const agreements = await getDb().Agreement.findAll({
      where: { landlordId: req.user.id },
      include: [
        { model: User,     as:"tenant",   attributes:["firstName","lastName","email"] },
        { model: Property, as:"property", attributes:["title","district","mainImage"] },
      ],
      order: [["createdAt","DESC"]],
    });
    return res.json({ success:true, data:agreements });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// GET /api/agreements/my  (tenant)
const getTenantAgreements = async (req, res) => {
  try {
    const agreements = await getDb().Agreement.findAll({
      where: { tenantId: req.user.id },
      include: [
        { model: User,     as:"landlord", attributes:["firstName","lastName","email"] },
        { model: Property, as:"property", attributes:["title","district","mainImage","rentAmount"] },
      ],
      order: [["createdAt","DESC"]],
    });
    return res.json({ success:true, data:agreements });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// GET /api/agreements/:id
const getById = async (req, res) => {
  try {
    const agreement = await getDb().Agreement.findByPk(req.params.id, {
      include: [
        { model: User,     as:"landlord", attributes:["firstName","lastName","email"] },
        { model: User,     as:"tenant",   attributes:["firstName","lastName","email"] },
        { model: Property, as:"property" },
      ],
    });
    if (!agreement) return res.status(404).json({ success:false, message:"Agreement not found" });
    // Only parties can view
    if (agreement.landlordId !== req.user.id && agreement.tenantId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success:false, message:"Forbidden" });
    }
    return res.json({ success:true, data:agreement });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// PUT /api/agreements/:id/sign  (tenant signs)
const sign = async (req, res) => {
  try {
    const { tenantSignature, tenantName, signedAt } = req.body;
    const agreement = await getDb().Agreement.findOne({
      where: { id: req.params.id, tenantId: req.user.id },
    });
    if (!agreement) return res.status(404).json({ success:false, message:"Agreement not found" });
    if (agreement.tenantSigned) return res.status(400).json({ success:false, message:"Already signed" });

    const bothSigned = agreement.landlordSigned && !!tenantSignature;
    await agreement.update({
      tenantSignature,
      tenantSigned: true,
      status: bothSigned ? "signed" : "pending_signature",
      signedAt: bothSigned ? (signedAt || new Date()) : null,
    });

    if (bothSigned) {
      // Award trust score for signing a lease
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

    return res.json({ success:true, message:"Agreement signed", data:agreement });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

module.exports = { create, getLandlordAgreements, getTenantAgreements, getById, sign };