// router/newsRoutes.js
const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware"); // ✅ add this

const {
  createNews,
  getAllNews,
  getNewsById,
  likeNews,
  dislikeNews,
  commentOnNews,
  shareNews,
  getComments,
} = require("../controllers/newsController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public
router.get("/", getAllNews);
router.get("/:id", getNewsById);
router.get("/:id/comments", getComments);

// Admin create (✅ supports form-data + image upload)
router.post("/", protect, adminOnly, upload.single("image"), createNews);

// Reactions / Comments (must be logged in)
router.post("/:id/like", protect, likeNews);
router.post("/:id/dislike", protect, dislikeNews);
router.post("/:id/comment", protect, commentOnNews);

// Share (public)
router.post("/:id/share", shareNews);

module.exports = router;