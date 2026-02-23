const nodemailer = require("nodemailer");

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter connectivity
const verifyTransport = async () => {
  try {
    await transporter.verify();
    console.log("Email transporter verified");
    return true;
  } catch (err) {
    console.warn("Email transporter verification failed:", err && err.message ? err.message : err);
    throw err;
  }
};

// Send OTP email
const sendOTPEmail = async (email, otp, firstName) => {
  // In development mode, log OTP to console instead of sending email
  if (process.env.NODE_ENV === "development") {
    console.log(`\n✅ [DEV MODE] OTP for ${email}: ${otp}\n`);
    return { messageId: "dev-mode" };
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
   subject: "InzuTrust Account Verification",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #007bff; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">InzuTrust</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #333333; font-size: 20px; margin-top: 0;">Verify Your Email Address</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.5;">Dear ${firstName},</p>
          <p style="color: #555555; font-size: 16px; line-height: 1.5;">Thank you for registering with InzuTrust. To secure your account and complete the registration process, please use the one-time verification code (OTP) provided below:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; border: 1px solid #e0e0e0;">
            <h1 style="color: #007bff; margin: 0; letter-spacing: 8px; font-size: 36px;">${otp}</h1>
          </div>
          
          <p style="color: #555555; font-size: 16px; line-height: 1.5;"><strong>Note:</strong> This OTP is valid for 10 minutes only. If it expires, you may request a new one.</p>
          <p style="color: #555555; font-size: 16px; line-height: 1.5;">If you did not initiate this registration, please disregard this email and contact our support team if needed.</p>
          
          <p style="color: #555555; font-size: 16px; line-height: 1.5;">Best regards,<br>The InzuTrust Team</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #888888;">
          <p style="margin: 0;">&copy; 2026 InzuTrust. All rights reserved.</p>
          <p style="margin: 5px 0 0;"><a href="https://www.inzutrust.com" style="color: #007bff; text-decoration: none;">www.inzutrust.com</a> | <a href="mailto:support@inzutrust.com" style="color: #007bff; text-decoration: none;">Support</a></p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};

module.exports = {
  sendOTPEmail,
  verifyTransport,
  transporter,
};
