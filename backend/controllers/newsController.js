// controllers/newsController.js
const NewsPost = require("../model/newsPostModel");
const NewsReaction = require("../model/newsReactionModel");
const NewsComment = require("../model/newsCommentModel");

const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/**
 * Helper: counts for a post
 */
const getCounts = async (newsPostId) => {
  const likes = await NewsReaction.count({ where: { newsPostId, type: "like" } });
  const dislikes = await NewsReaction.count({ where: { newsPostId, type: "dislike" } });
  const comments = await NewsComment.count({ where: { newsPostId } });
  return { likes, dislikes, comments };
};

/**
 * ADMIN: Create news post (supports image upload to Cloudinary)
 * POST /api/news
 * form-data: title, content, image(file)
 */
const createNews = async (req, res) => {
  try {
    const title = req.body?.title;
    const content = req.body?.content;

    if (!title || !content) {
      // cleanup uploaded local file if exists
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }

      return res.status(400).json({
        success: false,
        message: "title and content are required",
      });
    }

    let imageUrl = null;

    // ✅ Upload image to Cloudinary if provided
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "news_images",
      });

      imageUrl = uploadResult.secure_url;

      // ✅ Remove local uploaded file after Cloudinary upload
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }

    const created = await NewsPost.create({
      title: title.trim(),
      content,
      image: imageUrl, // ✅ Cloudinary URL saved
      authorId: req.user.id,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    // cleanup local file if any error happened
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Public: Get all news
 * GET /api/news
 */
const getAllNews = async (req, res) => {
  try {
    const posts = await NewsPost.findAll({
      order: [["createdAt", "DESC"]],
    });

    const withCounts = await Promise.all(
      posts.map(async (p) => {
        const counts = await getCounts(p.id);
        return { ...p.toJSON(), ...counts };
      })
    );

    return res.json({ success: true, data: withCounts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Public: Get single news
 * GET /api/news/:id
 */
const getNewsById = async (req, res) => {
  try {
    const post = await NewsPost.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "News not found" });
    }

    const counts = await getCounts(post.id);

    return res.json({ success: true, data: { ...post.toJSON(), ...counts } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Protected: Like
 * POST /api/news/:id/like
 */
const likeNews = async (req, res) => {
  try {
    const newsPostId = Number(req.params.id);

    const post = await NewsPost.findByPk(newsPostId);
    if (!post) return res.status(404).json({ success: false, message: "News not found" });

    const existing = await NewsReaction.findOne({
      where: { newsPostId, userId: req.user.id },
    });

    if (existing && existing.type === "like") {
      return res.status(400).json({ success: false, message: "You already liked this post" });
    }

    if (existing && existing.type === "dislike") {
      existing.type = "like";
      await existing.save();
    }

    if (!existing) {
      await NewsReaction.create({
        newsPostId,
        userId: req.user.id,
        type: "like",
      });
    }

    const counts = await getCounts(newsPostId);
    return res.json({ success: true, message: "Liked", ...counts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Protected: Dislike
 * POST /api/news/:id/dislike
 */
const dislikeNews = async (req, res) => {
  try {
    const newsPostId = Number(req.params.id);

    const post = await NewsPost.findByPk(newsPostId);
    if (!post) return res.status(404).json({ success: false, message: "News not found" });

    const existing = await NewsReaction.findOne({
      where: { newsPostId, userId: req.user.id },
    });

    if (existing && existing.type === "dislike") {
      return res.status(400).json({ success: false, message: "You already disliked this post" });
    }

    if (existing && existing.type === "like") {
      existing.type = "dislike";
      await existing.save();
    }

    if (!existing) {
      await NewsReaction.create({
        newsPostId,
        userId: req.user.id,
        type: "dislike",
      });
    }

    const counts = await getCounts(newsPostId);
    return res.json({ success: true, message: "Disliked", ...counts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Protected: Add comment
 * POST /api/news/:id/comment
 * body: { "content": "..." }
 */
const commentOnNews = async (req, res) => {
  try {
    const newsPostId = Number(req.params.id);
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    const post = await NewsPost.findByPk(newsPostId);
    if (!post) return res.status(404).json({ success: false, message: "News not found" });

    const created = await NewsComment.create({
      newsPostId,
      userId: req.user.id,
      content: content.trim(),
    });

    const counts = await getCounts(newsPostId);
    return res.status(201).json({
      success: true,
      message: "Comment added",
      data: created,
      ...counts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Share
 * POST /api/news/:id/share
 */
const shareNews = async (req, res) => {
  try {
    const newsPostId = Number(req.params.id);

    const post = await NewsPost.findByPk(newsPostId);
    if (!post) return res.status(404).json({ success: false, message: "News not found" });

    post.shareCount += 1;
    await post.save();

    const counts = await getCounts(newsPostId);

    return res.json({
      success: true,
      message: "Share recorded",
      shareCount: post.shareCount,
      ...counts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Public: Get comments for a post
 * GET /api/news/:id/comments
 */
const getComments = async (req, res) => {
  try {
    const newsPostId = Number(req.params.id);

    const post = await NewsPost.findByPk(newsPostId);
    if (!post) return res.status(404).json({ success: false, message: "News not found" });

    const comments = await NewsComment.findAll({
      where: { newsPostId },
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, data: comments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createNews,
  getAllNews,
  getNewsById,
  likeNews,
  dislikeNews,
  commentOnNews,
  shareNews,
  getComments,
};