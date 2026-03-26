// /controllers/userController.js
const userService    = require("../services/userService");
const { validationResult } = require("express-validator");
const User           = require("../model/userModel");
const generateToken  = require("../utils/generateToken");

// Lazy-load audit service — avoids circular dependency at startup
const audit = () => require("../services/auditLogService");

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
      actorId:   result.user?.id   || null,
      actorName: `${req.body.firstName || ""} ${req.body.lastName || ""}`.trim(),
      actorRole: req.body.role     || "tenant",
      action:    "New user registered",
      target:    req.body.email,
      sourceIp:  req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || null,
      userAgent: req.headers["user-agent"] || null,
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
      actorId:   result.user?.id   || null,
      actorName: result.user ? `${result.user.firstName} ${result.user.lastName}` : email,
      actorRole: result.user?.role || "unknown",
      action:    "User logged in",
      target:    email,
      sourceIp:  req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || null,
      userAgent: req.headers["user-agent"] || null,
    });

    return res.status(200).json({ success: true, message: "Login successful", data: result });
  } catch (error) {
    // Log failed login attempt
    audit().log.warning({
      actorId:   null,
      actorName: "Unknown",
      actorRole: "system",
      action:    "Failed login attempt",
      target:    req.body.email || "unknown",
      sourceIp:  req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || null,
      userAgent: req.headers["user-agent"] || null,
      metadata:  { reason: error.message },
    });

    return res.status(401).json({ success: false, message: error.message || "Login failed" });
  }
};

// ── Google Auth ───────────────────────────────────────────────────────────────
const googleAuth = async (req, res) => {
  try {
    const { email, firstName, lastName, role } = req.body;

    let user = await User.findOne({ where: { email } });
    const isNew = !user;

    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        role:       role || "tenant",
        authType:   "google",
        isVerified: true,
      });
    }

    if (user.isVerified) {
      const token = generateToken(user.id);

      // Log Google login / registration
      audit().log.info({
        actorId:   user.id,
        actorName: `${user.firstName} ${user.lastName}`,
        actorRole: user.role,
        action:    isNew ? "New user registered via Google" : "User logged in via Google",
        target:    user.email,
        sourceIp:  req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || null,
        userAgent: req.headers["user-agent"] || null,
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        isVerified: true,
        data: { token, user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName } },
      });
    }
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── OTP Verification ──────────────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await userService.verifyOTP(email, otp);

    audit().log.success({
      actorName: email,
      actorRole: "tenant",
      action:    "Email OTP verified",
      target:    email,
      sourceIp:  req.ip || null,
    });

    return res.status(200).json({ success: true, message: "Email verified successfully", data: result });
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
      actorId:   req.user.id,
      actorName: `${req.user.firstName} ${req.user.lastName}`,
      actorRole: req.user.role,
      action:    "Profile updated",
      target:    req.user.email,
      sourceIp:  req.ip || null,
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
  // Log logout if token was valid (req.user set by protect middleware)
  if (req.user) {
    audit().log.info({
      actorId:   req.user.id,
      actorName: `${req.user.firstName} ${req.user.lastName}`,
      actorRole: req.user.role,
      action:    "User logged out",
      target:    req.user.email,
      sourceIp:  req.ip || null,
    });
  }
  return res.status(200).json({ success: true, message: "Logged out successfully. Please discard your token." });
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