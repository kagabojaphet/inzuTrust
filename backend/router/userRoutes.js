// /router/userRoutes.js
const express = require("express");
const router = express.Router();

// Ensure these names exactly match the module.exports in userController.js
const {
  registerUser,
  loginUser,
  logoutUser,
  verifyOTP, // Fixed case to match controller
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
router.post("/verify-otp", otpValidation, verifyOTP);

// --- Protected ---
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/logout", protect, logoutUser);

// --- Admin ---
router.get("/", protect, adminOnly, getAllUsers); 
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;