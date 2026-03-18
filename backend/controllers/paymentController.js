// controllers/paymentController.js
const notificationService = require("../services/notificationService");
const trustScoreService   = require("../services/trustScoreService");
const { Op } = require("sequelize");

// Lazy-load DB to avoid circular require on startup
const getDb = () => require("../model");


// POST /api/payments  (landlord records a payment or tenant pays)
const create = async (req, res) => {
  try {
    const payment = await getDb().Payment.create({ ...req.body });

    // If paid on time → trust score +2
    if (payment.status === "paid" && payment.dueDate) {
      const isLate = payment.paidAt && new Date(payment.paidAt) > new Date(payment.dueDate);
      await trustScoreService.addEvent({
        tenantId: payment.tenantId,
        reason: isLate ? "late_payment" : "on_time_payment",
        referenceId: payment.id, referenceType: "Payment",
        note: isLate ? "Late payment recorded" : "On-time payment",
      });

      if (isLate) {
        await notificationService.send({
          userId: payment.tenantId,
          type: "payment_late",
          title: "Late Payment Recorded",
          message: `Your payment of ${payment.amount} RWF was recorded late. Your trust score has been updated.`,
          referenceId: payment.id, referenceType: "Payment",
        });
      } else {
        await notificationService.send({
          userId: payment.tenantId,
          type: "payment_received",
          title: "Payment Confirmed",
          message: `Your rent payment of ${payment.amount} RWF has been confirmed. Trust score +2.`,
          referenceId: payment.id, referenceType: "Payment",
        });
      }
    }

    return res.status(201).json({ success:true, message:"Payment recorded", data:payment });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// GET /api/payments  (landlord — all their payments)
const getLandlordPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = { landlordId: req.user.id };
    if (status) where.status = status;

    const { count, rows } = await getDb().Payment.findAndCountAll({
      where, limit: Number(limit), offset: (page-1)*limit,
      include: [
        { model: User,     as:"tenant",   attributes:["firstName","lastName","email"] },
        { model: Property, as:"property", attributes:["title","district"] },
      ],
      order: [["createdAt","DESC"]],
    });

    return res.json({ success:true, total:count, page:Number(page), data:rows });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// GET /api/payments/my  (tenant)
const getTenantPayments = async (req, res) => {
  try {
    const payments = await getDb().Payment.findAll({
      where: { tenantId: req.user.id },
      include: [
        { model: Property, as:"property", attributes:["title","district"] },
        { model: Agreement,as:"agreement",attributes:["docId","startDate","endDate"] },
      ],
      order: [["dueDate","DESC"]],
    });
    return res.json({ success:true, data:payments });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// PUT /api/payments/:id/release  (admin — release from escrow)
const releaseEscrow = async (req, res) => {
  try {
    const payment = await getDb().Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ success:false, message:"Payment not found" });
    await payment.update({ inEscrow:false, releasedAt:new Date(), releasedBy:req.user.id, status:"paid" });
    return res.json({ success:true, message:"Escrow released", data:payment });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

// GET /api/admin/payments  (admin — all payments)
const adminGetAll = async (req, res) => {
  try {
    const { status, page=1, limit=20 } = req.query;
    const where = {};
    if (status) where.status = status;
    const { count, rows } = await getDb().Payment.findAndCountAll({
      where, limit:Number(limit), offset:(page-1)*limit,
      include: [
        { model: User, as:"tenant",   attributes:["firstName","lastName"] },
        { model: User, as:"landlord", attributes:["firstName","lastName"] },
        { model: Property, as:"property", attributes:["title"] },
      ],
      order: [["createdAt","DESC"]],
    });
    return res.json({ success:true, total:count, data:rows });
  } catch (err) {
    return res.status(500).json({ success:false, message:err.message });
  }
};

module.exports = { create, getLandlordPayments, getTenantPayments, releaseEscrow, adminGetAll };