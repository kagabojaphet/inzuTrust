// /controllers/userController.js
const userService = require("../services/userService");
const { validationResult } = require("express-validator");

/**
 * @desc    Register new user
 * @route   POST /api/users/register
 * @access  Public klnksngkljjljwfgrfvs
 * sfgsgdsdkhbkj ksjd
 * sfgkbjsfg
 */
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const result = await userService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

/**
 * @desc    Get user profile (Includes role-specific profile data)
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "User not found",
    });
  }
};

/**
 * @desc    Update user profile (Updates both User and Profile tables)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const updated = await userService.updateUserProfile(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Update failed",
    });
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/users/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await userService.verifyOTP(email, otp);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "OTP verification failed",
    });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/users/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.resendOTP(email);
    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to resend OTP",
    });
  }
};

/**
 * @desc    Get all users (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete user (Admin only)
 */
const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const logoutUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully. Please discard your token.",
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  verifyOTP,
  resendOTP,
};