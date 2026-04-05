// router/userRoutes.js  — ADD change-password route
const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const {
  googleAuth, registerUser, loginUser, logoutUser,
  verifyOTP, resendOTP, getUserProfile, updateUserProfile,
} = require("../controllers/userController");
const { protect, landlordOnly } = require("../middleware/authMiddleware");
const User = require("../model/userModel");

router.post("/register",    registerUser);
router.post("/login",       loginUser);
router.post("/google-auth", googleAuth);
router.post("/verify-otp",  verifyOTP);
router.post("/resend-otp",  resendOTP);

router.get ("/profile", protect, getUserProfile);
router.put ("/profile", protect, updateUserProfile);
router.post("/logout",  protect, logoutUser);

// ── Change password ───────────────────────────────────────────────────────────
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "currentPassword and newPassword are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
    }

    const user = await User.findByPk(req.user.id);
    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: "Password change not available for social accounts." });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });

    return res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── Landlord profile ──────────────────────────────────────────────────────────
router.post("/landlords/profile", protect, landlordOnly, async (req, res) => {
  try {
    const { LandlordProfile } = require("../model");
    const [profile, created] = await LandlordProfile.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        userId: req.user.id,
        companyName:     req.body.companyName     || null,
        tinNumber:       req.body.tinNumber       || null,
        businessAddress: req.body.businessAddress || null,
        website:         req.body.website         || null,
        bio:             req.body.bio             || null,
      },
    });
    if (!created) await profile.update(req.body);
    return res.status(created ? 201 : 200).json({
      success: true,
      message: created ? "Profile created" : "Profile updated",
      data: profile,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;