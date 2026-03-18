// controllers/disputeController.js
const notificationService = require("../services/notificationService");
const trustScoreService   = require("../services/trustScoreService");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Helper to safely access the database and models without circular dependency issues
const getDb = () => require("../model");

const genDocId = () => `DIS-${new Date().getFullYear()}-${Math.floor(100+Math.random()*900)}`;

/**
 * Returns the standard include array for Dispute queries.
 * We wrap this in a function so that models like User and Property 
 * are only evaluated when the function is executed.
 */
const getIncludeBase = () => {
    const { User, Property, DisputeMessage, DisputeEvidence } = getDb();
    return [
        { model: User,     as: "reporter",   attributes: ["id", "firstName", "lastName", "role"] },
        { model: User,     as: "respondent", attributes: ["id", "firstName", "lastName", "role"] },
        { model: Property, as: "property",   attributes: ["title", "district"] },
        { 
            model: DisputeMessage, 
            as: "messages", 
            include: [{ model: User, as: "sender", attributes: ["id", "firstName", "lastName", "role"] }] 
        },
        { 
            model: DisputeEvidence, 
            as: "evidence", 
            include: [{ model: User, as: "uploader", attributes: ["id", "firstName", "lastName"] }] 
        },
    ];
};

// POST /api/disputes  (tenant or landlord files)
const create = async (req, res) => {
    try {
        const { title, description, category, claimAmount, propertyId, respondentId, agreementId } = req.body;
        const reporterId = req.user.id;

        const dispute = await getDb().Dispute.create({
            docId: genDocId(),
            title,
            description,
            category,
            claimAmount: claimAmount ? Number(claimAmount) : null,
            propertyId,
            respondentId,
            agreementId,
            reporterId,
            status: "open",
            stage: 0,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days deadline
        });

        // System message
        await getDb().DisputeMessage.create({
            disputeId: dispute.id,
            senderId: reporterId,
            text: `Dispute #${dispute.docId} filed. Both parties have 7 days to submit evidence.`,
            isSystem: true,
        });

        // Notify respondent
        if (respondentId) {
            await notificationService.send({
                userId: respondentId,
                type: "dispute_opened",
                title: "New Dispute Filed",
                message: `A dispute has been filed against you: "${title}". Please review and respond.`,
                referenceId: dispute.id,
                referenceType: "Dispute",
            });
        }

        return res.status(201).json({ success: true, message: "Dispute filed", data: dispute });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/disputes/my  (tenant or landlord)
const getMy = async (req, res) => {
    try {
        const userId = req.user.id;
        const { Op } = require("sequelize");

        const disputes = await getDb().Dispute.findAll({
            where: { [Op.or]: [{ reporterId: userId }, { respondentId: userId }] },
            include: getIncludeBase(),
            order: [["createdAt", "DESC"]],
        });
        return res.json({ success: true, data: disputes });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/disputes/:id
const getById = async (req, res) => {
    try {
        const dispute = await getDb().Dispute.findByPk(req.params.id, { 
            include: getIncludeBase() 
        });
        if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });
        return res.json({ success: true, data: dispute });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/disputes/:id/messages  (send a message in a dispute)
const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { User, Dispute, DisputeMessage } = getDb();

        const dispute = await Dispute.findByPk(req.params.id);
        if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });
        if (dispute.status === "resolved") return res.status(400).json({ success: false, message: "Dispute is closed" });

        const msg = await DisputeMessage.create({ 
            disputeId: dispute.id, 
            senderId: req.user.id, 
            text 
        });
        
        const withSender = await DisputeMessage.findByPk(msg.id, {
            include: [{ model: User, as: "sender", attributes: ["id", "firstName", "lastName", "role"] }],
        });

        const otherId = dispute.reporterId === req.user.id ? dispute.respondentId : dispute.reporterId;
        if (otherId) {
            await notificationService.send({
                userId: otherId,
                type: "dispute_updated",
                title: "New message in dispute",
                message: `A new message was added to dispute #${dispute.docId}`,
                referenceId: dispute.id,
                referenceType: "Dispute",
            });
        }

        return res.status(201).json({ success: true, data: withSender });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/disputes/:id/evidence  (upload file)
const uploadEvidence = async (req, res) => {
    try {
        const dispute = await getDb().Dispute.findByPk(req.params.id);
        if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });

        const results = [];
        if (req.files?.length) {
            for (const file of req.files) {
                const upload = await cloudinary.uploader.upload(file.path, { folder: "disputes" });
                try { fs.unlinkSync(file.path); } catch (_) {}

                const ext = file.originalname.split(".").pop().toLowerCase();
                const fileType = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? "image"
                               : ext === "pdf" ? "pdf" : "document";

                const ev = await getDb().DisputeEvidence.create({
                    disputeId: dispute.id,
                    uploadedBy: req.user.id,
                    fileName: file.originalname,
                    fileUrl: upload.secure_url,
                    fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                    fileType,
                });
                results.push(ev);
            }
        }

        return res.status(201).json({ success: true, data: results });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/disputes/:id/stage  (admin advances stage)
const advanceStage = async (req, res) => {
    try {
        const dispute = await getDb().Dispute.findByPk(req.params.id);
        if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });

        const stageMap = { 0: "open", 1: "under_review", 2: "mediation", 3: "resolved" };
        const newStage = Math.min(dispute.stage + 1, 3);
        await dispute.update({ stage: newStage, status: stageMap[newStage] });

        const stageLabels = ["Filed", "Evidence Review", "Mediation", "Resolution"];
        await getDb().DisputeMessage.create({
            disputeId: dispute.id,
            senderId: req.user.id,
            text: `Case status updated to '${stageLabels[newStage]}'`,
            isSystem: true,
        });

        for (const uid of [dispute.reporterId, dispute.respondentId].filter(Boolean)) {
            await notificationService.send({
                userId: uid,
                type: "dispute_updated",
                title: "Dispute Status Updated",
                message: `Your dispute #${dispute.docId} has moved to ${stageLabels[newStage]} stage.`,
                referenceId: dispute.id,
                referenceType: "Dispute",
            });
        }

        return res.json({ success: true, data: dispute });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/disputes/:id/resolve  (admin resolves)
const resolve = async (req, res) => {
    try {
        const { resolution, favoredParty } = req.body;
        const { User, Dispute, DisputeMessage } = getDb();

        const dispute = await Dispute.findByPk(req.params.id);
        if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });

        await dispute.update({ status: "resolved", stage: 3, resolution, resolvedAt: new Date(), resolvedBy: req.user.id });

        if (favoredParty === "reporter" && dispute.respondentId) {
            await trustScoreService.addEvent({
                tenantId: dispute.respondentId,
                reason: "dispute_lost",
                referenceId: dispute.id,
                referenceType: "Dispute",
                note: "Dispute resolved against you",
            });
        } else if (favoredParty === "respondent" && dispute.reporterId) {
            const reporter = await User.findByPk(dispute.reporterId);
            if (reporter?.role === "tenant") {
                await trustScoreService.addEvent({
                    tenantId: dispute.reporterId,
                    reason: "report_filed",
                    referenceId: dispute.id,
                    referenceType: "Dispute",
                    note: "Dispute resolved against you",
                });
            }
        }

        for (const uid of [dispute.reporterId, dispute.respondentId].filter(Boolean)) {
            await notificationService.send({
                userId: uid,
                type: "dispute_resolved",
                title: "Dispute Resolved",
                message: `Dispute #${dispute.docId} has been resolved. ${resolution || ""}`,
                referenceId: dispute.id,
                referenceType: "Dispute",
            });
        }

        return res.json({ success: true, message: "Dispute resolved", data: dispute });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/disputes  (admin)
const adminGetAll = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const { User, Property, Dispute } = getDb();
        const where = {};
        if (status) where.status = status;

        const { count, rows } = await Dispute.findAndCountAll({
            where,
            limit: Number(limit),
            offset: (page - 1) * limit,
            include: [
                { model: User,     as: "reporter",   attributes: ["firstName", "lastName", "role"] },
                { model: User,     as: "respondent", attributes: ["firstName", "lastName", "role"] },
                { model: Property, as: "property",   attributes: ["title"] },
            ],
            order: [["createdAt", "DESC"]],
        });
        return res.json({ success: true, total: count, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { create, getMy, getById, sendMessage, uploadEvidence, advanceStage, resolve, adminGetAll };