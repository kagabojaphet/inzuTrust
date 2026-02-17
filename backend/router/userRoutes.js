const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
} = require("../controllers/userController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  registerValidation,
  loginValidation,
} = require("../validator/userValidator");

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);

// ─── Protected Routes (logged-in users) ──────────────────────────────────────
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get("/", protect, adminOnly, getAllUsers);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;