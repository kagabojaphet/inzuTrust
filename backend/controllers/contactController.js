// controllers/contactController.js
const { validationResult } = require("express-validator");
const ContactMessage = require("../model/contactMessageModel");

// POST /api/contact
exports.createContactMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { fullName, email, phone, subject, message } = req.body;

    const created = await ContactMessage.create({
      fullName,
      email: email || null,
      phone: phone || null,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Message received. We will contact you soon.",
      data: created,
    });
  } catch (err) {
    console.error("createContactMessage error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/contact (admin/manager)
exports.getAllContactMessages = async (req, res) => {
  try {
    const items = await ContactMessage.findAll({ order: [["createdAt", "DESC"]] });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error("getAllContactMessages error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/contact/:id/status (admin/manager)
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const item = await ContactMessage.findByPk(id);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });

    item.status = status;
    await item.save();

    return res.json({ success: true, message: "Status updated", data: item });
  } catch (err) {
    console.error("updateContactStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};