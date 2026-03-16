const express = require("express");
const router = express.Router();
const { 
  googleAuth, 
  registerUser, 
  loginUser, 
  verifyOTP, 
  getUserProfile, 
  updateUserProfile 
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-auth", googleAuth);
router.post("/verify-otp", verifyOTP);

// Private routes (Require Token)
router.get("/profile", protect, getUserProfile); // Fixed the 404
router.put("/profile", protect, updateUserProfile);

module.exports = router;