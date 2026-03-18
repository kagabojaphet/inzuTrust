// router/userRoutes.js
const express = require("express");
const router  = express.Router();
const {
  googleAuth,
  registerUser,
  loginUser,
  verifyOTP,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");
const { protect, landlordOnly } = require("../middleware/authMiddleware");

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/register",    registerUser);
router.post("/login",       loginUser);
router.post("/google-auth", googleAuth);
router.post("/verify-otp",  verifyOTP);

// ── Private ───────────────────────────────────────────────────────────────────
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// ── Landlord profile (used by tenant dashboard to show landlord info) ─────────
router.post("/landlords/profile", protect, landlordOnly, async (req, res) => {
  try {
    const { LandlordProfile } = require("../model");
    const [profile, created] = await LandlordProfile.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        userId:          req.user.id,
        companyName:     req.body.companyName     || null,
        tinNumber:       req.body.tinNumber       || null,
        businessAddress: req.body.businessAddress || null,
        website:         req.body.website         || null,
        bio:             req.body.bio             || null,
      },
    });
    if (!created) {
      await profile.update(req.body);
    }
    return res.status(created ? 201 : 200).json({
      success: true,
      message: created ? "Profile created" : "Profile updated",
      data:    profile,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;