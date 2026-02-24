const express = require("express");
const router = express.Router();

// 1. Import carefully. If any of these are misspelled, they will be 'undefined'
const {
  registerUser,
  loginUser,
  logoutUser,
  verifyOtp,
  resendOTP,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser
} = require("../controllers/userController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  registerValidation,
  loginValidation,
  otpValidation,
} = require("../validator/userValidator");

// --- Public ---
router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.post("/verify-otp", otpValidation, verifyOtp);

// --- Protected ---
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/logout", protect, logoutUser);

// --- Admin (Line 34 is likely around here) ---
// If 'getAllUsers' or 'adminOnly' is undefined, this line crashes the server
router.get("/", protect, adminOnly, getAllUsers); 
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;