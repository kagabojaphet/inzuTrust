// controllers/agreementController.js — COMPLETE FILE
// Includes: create, landlord list, tenant list, getById, sign,
//           getAllAgreements (admin), terminateAgreement, respondTermination, resolveTermination
const notificationService = require("../services/notificationService");
const trustScoreService   = require("../services/trustScoreService");

const getDb    = () => require("../model");
const genDocId = () => `RW-${Math.floor(1000 + Math.random() * 9000)}-KGL`;

// ─── POST /api/agreements  (landlord creates) ──────────────────────────────
const create = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const data = req.body;

    const agreement = await getDb().Agreement.create({
      ...data,
      landlordId,
      docId:          data.docId || genDocId(),
      landlordSigned: !!data.landlordSignature,
      status: data.landlordSignature && data.tenantSignature ? "signed" : "pending_signature",
      signedAt: data.landlordSignature && data.tenantSignature ? new Date() : null,
    });

    if (data.tenantId) {
      await notificationService.send({
        userId: data.tenantId,
        type: "lease_pending",
        title: "Lease Agreement Ready",
        message: `Your landlord has created a lease agreement. Please review and sign.`,
        referenceId: agreement.id, referenceType: "Agreement",
      });
    }
    return res.status(201).json({ success: true, message: "Agreement created", data: agreement });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/agreements  (landlord — their agreements) ───────────────────
const getLandlordAgreements = async (req, res) => {
  try {
    const { Agreement, User, Property } = getDb();
    const agreements = await Agreement.findAll({
      where: { landlordId: req.user.id },
      include: [
        { model: User,     as: "tenant",   attributes: ["id","firstName","lastName","email","phone"] },
        { model: Property, as: "property", attributes: ["id","title","district","mainImage","rentAmount","type"] },
      ],
      order: [["createdAt","DESC"]],
    });
    return res.json({ success: true, data: agreements });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/agreements/my  (tenant — their agreements) ──────────────────
const getTenantAgreements = async (req, res) => {
  try {
    const { Agreement, User, Property } = getDb();
    const agreements = await Agreement.findAll({
      where: { tenantId: req.user.id },
      include: [
        { model: User,     as: "landlord", attributes: ["id","firstName","lastName","email","phone"] },
        { model: Property, as: "property", attributes: ["id","title","district","mainImage","rentAmount","type"] },
      ],
      order: [["createdAt","DESC"]],
    });
    return res.json({ success: true, data: agreements });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/agreements/all  (admin — ALL agreements) ────────────────────
const getAllAgreements = async (req, res) => {
  try {
    const { Agreement, User, Property } = getDb();
    const agreements = await Agreement.findAll({
      include: [
        { model: User,     as: "landlord", attributes: ["id","firstName","lastName","email"] },
        { model: User,     as: "tenant",   attributes: ["id","firstName","lastName","email"] },
        { model: Property, as: "property", attributes: ["id","title","district","mainImage","rentAmount"] },
      ],
      order: [["createdAt","DESC"]],
    });
    return res.json({ success: true, data: agreements });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/agreements/:id ──────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const { Agreement, User, Property } = getDb();
    const agreement = await Agreement.findByPk(req.params.id, {
      include: [
        { model: User,     as: "landlord", attributes: ["id","firstName","lastName","email","phone"] },
        { model: User,     as: "tenant",   attributes: ["id","firstName","lastName","email","phone"] },
        { model: Property, as: "property" },
      ],
    });
    if (!agreement) return res.status(404).json({ success: false, message: "Agreement not found" });
    const uid = req.user.id;
    if (agreement.landlordId !== uid && agreement.tenantId !== uid && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    return res.json({ success: true, data: agreement });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/agreements/:id/sign  (tenant signs) ─────────────────────────
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
      status:   bothSigned ? "signed" : "pending_signature",
      signedAt: bothSigned ? (signedAt || new Date()) : null,
    });

    if (bothSigned) {
      await trustScoreService.addEvent({
        tenantId: req.user.id, reason: "lease_completed",
        referenceId: agreement.id, referenceType: "Agreement",
        note: "Lease agreement signed",
      }).catch(() => {});
      await notificationService.send({
        userId: agreement.landlordId,
        type: "lease_signed",
        title: "Lease Agreement Signed",
        message: `${tenantName || "Tenant"} has signed the lease agreement.`,
        referenceId: agreement.id, referenceType: "Agreement",
      });
    }
    return res.json({ success: true, message: "Agreement signed", data: agreement });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/agreements/:id/terminate ────────────────────────────────────
// Used by: tenant, landlord (request termination) OR admin (force terminate)
const terminateAgreement = async (req, res) => {
  try {
    const { reason, proposedDate, forceByAdmin } = req.body;
    const { Agreement } = getDb();
    const uid  = req.user.id;
    const role = req.user.role;

    const agreement = await Agreement.findByPk(req.params.id);
    if (!agreement) return res.status(404).json({ success: false, message: "Agreement not found" });

    if (!["signed","pending_signature","termination_requested"].includes(agreement.status)) {
      return res.status(400).json({ success: false, message: "Agreement is not active" });
    }

    // ── Admin force-terminate ──────────────────────────────────────────────
    if (role === "admin" && forceByAdmin) {
      await agreement.update({ status: "terminated" });
      for (const userId of [agreement.tenantId, agreement.landlordId]) {
        await notificationService.send({
          userId, type: "lease_terminated",
          title: "Lease Terminated by Admin",
          message: `Your lease has been terminated by admin. Reason: ${reason || "Not specified"}`,
          referenceId: agreement.id, referenceType: "Agreement",
        }).catch(() => {});
      }
      return res.json({ success: true, message: "Agreement force-terminated." });
    }

    // ── Party termination request ──────────────────────────────────────────
    const isLandlord = uid === agreement.landlordId;
    const isTenant   = uid === agreement.tenantId;
    if (!isLandlord && !isTenant) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const requestedByRole = isLandlord ? "landlord" : "tenant";
    const terminationReq  = {
      requestedBy:     uid,
      requestedByRole,
      reason:          reason || "",
      proposedDate:    proposedDate || null,
      requestedAt:     new Date().toISOString(),
    };

    await agreement.update({
      status: "termination_requested",
      terminationRequest: JSON.stringify(terminationReq),
    });

    // Notify the other party
    const notifyId = isLandlord ? agreement.tenantId : agreement.landlordId;
    await notificationService.send({
      userId: notifyId,
      type: "termination_requested",
      title: "Termination Request",
      message: `${requestedByRole === "landlord" ? "Your landlord" : "Your tenant"} has requested to terminate the lease. Please respond within 7 days.`,
      referenceId: agreement.id, referenceType: "Agreement",
    });

    return res.json({ success: true, message: "Termination request submitted. The other party has been notified." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/agreements/:id/termination/respond  (other party responds) ──
const respondTermination = async (req, res) => {
  try {
    const { accept, counterReason } = req.body;
    const { Agreement } = getDb();
    const uid = req.user.id;

    const agreement = await Agreement.findByPk(req.params.id);
    if (!agreement) return res.status(404).json({ success: false, message: "Agreement not found" });
    if (agreement.status !== "termination_requested") {
      return res.status(400).json({ success: false, message: "No termination request pending" });
    }

    // Make sure respondent is the OTHER party
    const termReq = (() => { try { return JSON.parse(agreement.terminationRequest||"{}"); } catch { return {}; } })();
    if (termReq.requestedBy === uid) {
      return res.status(400).json({ success: false, message: "You cannot respond to your own request" });
    }

    if (accept) {
      // Both agreed → terminate
      await agreement.update({ status: "terminated" });
      for (const userId of [agreement.tenantId, agreement.landlordId]) {
        await notificationService.send({
          userId, type: "lease_terminated",
          title: "Lease Agreement Terminated",
          message: "Both parties agreed to terminate the lease.",
          referenceId: agreement.id, referenceType: "Agreement",
        }).catch(() => {});
      }
      return res.json({ success: true, message: "Termination accepted. Agreement is now terminated." });
    } else {
      // Disputed → stays in termination_requested state, admin reviews
      await agreement.update({
        terminationRequest: JSON.stringify({ ...termReq, disputed: true, counterReason: counterReason || "", disputedAt: new Date().toISOString() }),
      });
      return res.json({ success: true, message: "Termination disputed. An admin will review and make a final decision." });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/agreements/:id/termination/resolve  (admin resolves dispute) ─
const resolveTermination = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin only" });
    const { approve, adminNote } = req.body;
    const { Agreement } = getDb();

    const agreement = await Agreement.findByPk(req.params.id);
    if (!agreement) return res.status(404).json({ success: false, message: "Agreement not found" });

    const newStatus = approve ? "terminated" : "signed";
    await agreement.update({ status: newStatus });

    const msg = approve
      ? `Admin approved the termination. ${adminNote || ""}`
      : `Admin rejected the termination. Agreement remains active. ${adminNote || ""}`;

    for (const userId of [agreement.tenantId, agreement.landlordId]) {
      await notificationService.send({
        userId, type: "admin_decision",
        title: approve ? "Termination Approved" : "Termination Rejected",
        message: msg,
        referenceId: agreement.id, referenceType: "Agreement",
      }).catch(() => {});
    }
    return res.json({ success: true, message: `Termination ${approve ? "approved" : "rejected"}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  create, getLandlordAgreements, getTenantAgreements, getAllAgreements,
  getById, sign, terminateAgreement, respondTermination, resolveTermination,
};