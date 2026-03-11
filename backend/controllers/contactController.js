// controllers/contactController.js
const Contact = require("../model/contactModel");
const { sendContactAutoReply } = require("../config/emailConfig");

const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "name, email, and message are required",
      });
    }

    // Save contact message
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : null,
      message: message.trim(),
      status: "new",
    });

    // Send auto reply email
    await sendContactAutoReply(contact.name, contact.email);

    // Update status to replied
    await contact.update({ status: "replied" });

    return res.status(201).json({
      success: true,
      message: "Message received. Auto reply sent.",
      data: contact,
    });
  } catch (error) {
    console.error("Contact submit error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

module.exports = { submitContact };