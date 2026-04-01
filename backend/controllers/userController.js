// /controllers/userController.js
const userService = require("../services/userService");
const { validationResult } = require("express-validator");
const User = require("../model/userModel");
const generateToken = require("../utils/generateToken");

// Lazy-load audit service — avoids circular dependency at startup
const audit = () => require("../services/auditLogService");

/**
 * Internal helper to extract actor details for audit logs
 */
const fromReq = (req, userOverride = null) => {
  const user = userOverride || req.user;
  return {
    actorId: user?.id || null,
    actorName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "System",
    actorRole: user?.role || "unknown",
    sourceIp: req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || null,
    userAgent: req.headers["user-agent"] || null,
  };
};

// ── Register ──────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const result = await userService.registerUser(req.body);

    // Log new registration
    audit().log.info({
      ...fromReq(req, result.user),
      action: "New user registered",
      target: req.body.email,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Registration failed" });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUser({ email, password });

    // Log successful login
    audit().log.info({
      ...fromReq(req, result.user),
      action: "User logged in",
      target: email,
    });

    return res.status(200).json({ success: true, message: "Login successful", data: result });
  } catch (error) {
    // Log failed login attempt
    audit().log.warning({
      ...fromReq(req),
      actorName: "Unknown",
      actorRole: "system",
      action: "Failed login attempt",
      target: req.body.email || "unknown",
      metadata: { reason: error.message },
    });

    return res.status(401).json({ success: false, message: error.message || "Login failed" });
  }
};

// ── Google Auth ───────────────────────────────────────────────────────────────
const googleAuth = async (req, res) => {
  try {
    const { email, firstName, lastName, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required from Google provider" });
    }

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        role: role || "tenant",
        authType: "google",
        isVerified: false, // MANDATORY: Admin must verify manually later
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: "Your account is suspended. Contact support." });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          isVerified: user.isVerified,
          isRedFlagged: user.isRedFlagged 
        } 
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── OTP Verification ──────────────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // FIXED: Added the 'where' attribute to specify which user to update
    const [updatedRows] = await User.update(
      { isEmailVerified: true, otp: null, otpExpiry: null },
      { where: { email, otp } }
    );

    if (updatedRows === 0) {
      return res.status(400).json({ success: false, message: "Invalid OTP or email" });
    }

    audit().log.success({
      ...fromReq(req),
      actorName: email,
      action: "Email OTP verified",
      target: email,
    });

    return res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "OTP verification failed" });
  }
};

// ── Resend OTP ────────────────────────────────────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.resendOTP(email);
    return res.status(200).json({ success: true, message: "A new OTP has been sent to your email." });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to resend OTP" });
  }
};

// ── Profile ───────────────────────────────────────────────────────────────────
const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message || "User not found" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const updated = await userService.updateUserProfile(req.user.id, req.body);

    audit().log.info({
      ...fromReq(req),
      action: "Profile updated",
      target: req.user.email,
    });

    return res.status(200).json({ success: true, message: "Profile updated successfully", data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Update failed" });
  }
};

// ── Admin helpers ─────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
const logoutUser = async (req, res) => {
  if (req.user) {
    audit().log.info({
      ...fromReq(req),
      action: "User logged out",
      target: req.user.email,
    });
  }
  return res.status(200).json({ success: true, message: "Logged out successfully." });
};

module.exports = {
  registerUser,
  googleAuth,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  verifyOTP,
  resendOTP,
};