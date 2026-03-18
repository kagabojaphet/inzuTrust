// controllers/leaseApplicationController.js
const notificationService = require("../services/notificationService");

// Lazy-load DB to avoid circular require on startup
const getDb = () => require("../model");


// POST /api/lease-applications  (tenant)
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
      tenantId, propertyId,
      landlordId: property.landlordId,
      message, moveInDate, duration,
      status: "pending",
    });

    // Notify landlord
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

// GET /api/lease-applications/my  (tenant — their applications)
const getMyApplications = async (req, res) => {
  try {
    const apps = await getDb().LeaseApplication.findAll({
      where: { tenantId: req.user.id },
      include: [
        { model: require("../model").Property, as:"property", attributes:["title","district","sector","mainImage","rentAmount"] },
        { model: require("../model").User,     as:"landlord", attributes:["firstName","lastName","email"] },
      ],
      order: [["createdAt","DESC"]],
    });
    return res.json({ success:true, data:apps });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// GET /api/lease-applications/received  (landlord)
const getReceived = async (req, res) => {
  try {
    const apps = await getDb().LeaseApplication.findAll({
      where: { landlordId: req.user.id },
      include: [
        { model: require("../model").Property, as:"property", attributes:["title","district","sector","mainImage"] },
        { model: require("../model").User,     as:"tenant",   attributes:["firstName","lastName","email","phone"] },
      ],
      order: [["createdAt","DESC"]],
    });
    return res.json({ success:true, data:apps });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// PUT /api/lease-applications/:id/respond  (landlord)
const respond = async (req, res) => {
  try {
    const { status, landlordNote } = req.body; // accepted | rejected
    const app = await getDb().LeaseApplication.findOne({
      where: { id: req.params.id, landlordId: req.user.id },
    });
    if (!app) return res.status(404).json({ success:false, message:"Application not found" });

    await app.update({ status, landlordNote, respondedAt: new Date() });

    await notificationService.send({
      userId: app.tenantId,
      type: status === "accepted" ? "lease_application" : "general",
      title: status === "accepted" ? "Application Accepted!" : "Application Update",
      message: status === "accepted"
        ? "Your lease application has been accepted. The landlord will send you an agreement."
        : `Your lease application was not approved. Reason: ${landlordNote || "N/A"}`,
      referenceId: app.id, referenceType: "LeaseApplication",
    });

    return res.json({ success:true, message:`Application ${status}`, data:app });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

module.exports = { apply, getMyApplications, getReceived, respond };