// controllers/leaseApplicationController.js
const notificationService = require("../services/notificationService");
const getDb = () => require("../model");

// ── POST /api/lease-applications  (tenant) ────────────────────────────────────
const apply = async (req, res) => {
  try {
    const { propertyId, message, moveInDate, duration } = req.body;
    const tenantId = req.user.id;

    const property = await getDb().Property.findByPk(propertyId);
    if (!property) return res.status(404).json({ success:false, message:"Property not found" });

    const existing = await getDb().LeaseApplication.findOne({
      where: { tenantId, propertyId, status: ["draft","pending"] },
    });
    if (existing) return res.status(400).json({ success:false, message:"You already have an active application for this property" });

    const app = await getDb().LeaseApplication.create({
      tenantId, propertyId, landlordId: property.landlordId,
      message, moveInDate, duration, status:"pending",
    });

    await notificationService.send({
      userId: property.landlordId,
      type: "lease_application",
      title: "New Lease Application",
      message: `A tenant has applied for ${property.title}`,
      referenceId: app.id, referenceType: "LeaseApplication",
    });

    return res.status(201).json({ success:true, message:"Application submitted", data:app });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// ── GET /api/lease-applications/my  (tenant) ──────────────────────────────────
const getMyApplications = async (req, res) => {
  try {
    const { LeaseApplication, Property, User } = getDb();
    const apps = await LeaseApplication.findAll({
      where: { tenantId: req.user.id },
      include: [
        {
          model: Property, as:"property",
          // ← FIX: include rentAmount so the rent column renders
          attributes: ["id","title","district","sector","mainImage","rentAmount","type","bedrooms","bathrooms"],
        },
        {
          model: User, as:"landlord",
          attributes: ["firstName","lastName","email"],
        },
      ],
      order: [["createdAt","DESC"]],
    });
    return res.json({ success:true, data:apps });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// ── GET /api/lease-applications/received  (landlord) ─────────────────────────
const getReceived = async (req, res) => {
  try {
    const { LeaseApplication, Property, User } = getDb();
    const apps = await LeaseApplication.findAll({
      where: { landlordId: req.user.id },
      include: [
        {
          model: Property, as:"property",
          // ← FIX: rentAmount was missing — this caused the empty rent column
          attributes: ["id","title","district","sector","mainImage","rentAmount","type","bedrooms","bathrooms"],
        },
        {
          model: User, as:"tenant",
          attributes: ["id","firstName","lastName","email","phone","lastSeenAt"],
        },
      ],
      order: [["createdAt","DESC"]],
    });
    return res.json({ success:true, data:apps });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// ── PUT /api/lease-applications/:id/respond  (landlord) ───────────────────────
const respond = async (req, res) => {
  try {
    const { status, landlordNote } = req.body;
    if (!["accepted","rejected"].includes(status)) {
      return res.status(400).json({ success:false, message:"Status must be accepted or rejected" });
    }

    const { LeaseApplication } = getDb();
    const app = await LeaseApplication.findOne({
      where: { id: req.params.id, landlordId: req.user.id },
    });
    if (!app) return res.status(404).json({ success:false, message:"Application not found" });
    if (app.status !== "pending") {
      return res.status(400).json({ success:false, message:"Application already responded to" });
    }

    await app.update({ status, landlordNote, respondedAt: new Date() });

    await notificationService.send({
      userId: app.tenantId,
      type: status === "accepted" ? "lease_application" : "general",
      title: status === "accepted" ? "Application Accepted!" : "Application Update",
      message: status === "accepted"
        ? "Your lease application has been accepted. The landlord will send you an agreement."
        : `Your application was not approved. ${landlordNote ? `Reason: ${landlordNote}` : ""}`,
      referenceId: app.id, referenceType: "LeaseApplication",
    });

    return res.json({ success:true, message:`Application ${status}`, data:app });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

module.exports = { apply, getMyApplications, getReceived, respond };