const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification - OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Thank you for registering with InzuTrust!</p>
          <p>Your One-Time Password (OTP) for email verification is:</p>

          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; color: #007bff; letter-spacing: 5px;">${otp}</h1>
          </div>

          <p style="color: #666;">This OTP is valid for 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

/* ==============================
   CONTACT AUTO REPLY EMAIL
============================== */
const sendContactAutoReply = async (name, email) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "We received your message - InzuTrust",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${name},</h2>

          <p>Thank you for contacting <strong>InzuTrust</strong>.</p>

          <p>
            We have successfully received your message and our support team
            will get back to you shortly.
          </p>

          <p style="margin-top:20px;">Best regards,</p>
          <p><strong>InzuTrust Team</strong></p>

          <hr style="margin:20px 0">

          <p style="font-size:12px; color:#888;">
            This is an automatic reply confirming that we received your message.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Auto reply sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending auto reply email:", error);
    throw new Error("Failed to send auto reply email");
  }
};

module.exports = {
  sendOtpEmail,
  sendContactAutoReply,
};