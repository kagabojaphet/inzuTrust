const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyOtp,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  verifyOTP,
  resendOTP,
} = require("../controllers/userController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  registerValidation,
  loginValidation,
  otpValidation,
} = require("../validator/userValidator");

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.post("/verify-otp", otpValidation, verifyOtp);

// ─── Protected Routes (logged-in users) ──────────────────────────────────────
router.post("/logout", protect, logoutUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get("/", protect, adminOnly, getAllUsers);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;module.exports = router;