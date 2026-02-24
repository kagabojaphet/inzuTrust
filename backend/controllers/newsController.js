// controllers/newsController.js
const { sequelize } = require("../config/database");
const { validationResult } = require("express-validator");

const NewsPost = require("../model/newsPostModel");
const NewsReaction = require("../model/newsReactionModel");
const NewsComment = require("../model/newsCommentModel");

// GET /api/news
exports.listNews = async (req, res) => {
  try {
    const items = await NewsPost.findAll({ order: [["createdAt", "DESC"]] });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error("listNews error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/news/:id
exports.getNewsById = async (req, res) => {
  try {
    const item = await NewsPost.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: item });
  } catch (err) {
    console.error("getNewsById error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/news (admin/manager)
exports.createNews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { title, body, coverImage, status } = req.body;
    const created = await NewsPost.create({
      title,
      body,
      coverImage: coverImage || null,
      status: status || "PUBLISHED",
    });

    return res.status(201).json({ success: true, message: "Created", data: created });
  } catch (err) {
    console.error("createNews error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/news/:id (admin/manager)
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await NewsPost.findByPk(id);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });

    const { title, body, coverImage, status } = req.body;
    if (title !== undefined) item.title = title;
    if (body !== undefined) item.body = body;
    if (coverImage !== undefined) item.coverImage = coverImage;
    if (status !== undefined) item.status = status;

    await item.save();
    return res.json({ success: true, message: "Updated", data: item });
  } catch (err) {
    console.error("updateNews error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/news/:id (admin/manager)
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await NewsPost.findByPk(id);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });

    await item.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("deleteNews error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/news/:id/react
 * body: { type: "LIKE" | "DISLIKE" }
 * Requires auth: req.user.id
 */
exports.reactToNews = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user?.id; // needs your auth middleware
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const newsPostId = Number(req.params.id);
    const { type } = req.body;

    if (!["LIKE", "DISLIKE"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid reaction type" });
    }

    const post = await NewsPost.findByPk(newsPostId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!post) return res.status(404).json({ success: false, message: "Not found" });

    const existing = await NewsReaction.findOne({
      where: { newsPostId, userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // Helper to decrement safely
    const dec = (val) => (val > 0 ? val - 1 : 0);

    if (!existing) {
      await NewsReaction.create({ newsPostId, userId, type }, { transaction: t });
      if (type === "LIKE") post.likeCount += 1;
      else post.dislikeCount += 1;
    } else if (existing.type === type) {
      // toggle off
      await existing.destroy({ transaction: t });
      if (type === "LIKE") post.likeCount = dec(post.likeCount);
      else post.dislikeCount = dec(post.dislikeCount);
    } else {
      // switch reaction
      const prev = existing.type;
      existing.type = type;
      await existing.save({ transaction: t });

      if (prev === "LIKE") post.likeCount = dec(post.likeCount);
      else post.dislikeCount = dec(post.dislikeCount);

      if (type === "LIKE") post.likeCount += 1;
      else post.dislikeCount += 1;
    }

    await post.save({ transaction: t });
    await t.commit();

    return res.json({
      success: true,
      message: "Reaction updated",
      data: {
        newsPostId,
        likeCount: post.likeCount,
        dislikeCount: post.dislikeCount,
      },
    });
  } catch (err) {
    await t.rollback();
    console.error("reactToNews error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/news/:id/comments
 * body: { text: "..." }
 */
exports.addComment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const newsPostId = Number(req.params.id);
    const { text } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const post = await NewsPost.findByPk(newsPostId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!post) return res.status(404).json({ success: false, message: "Not found" });

    const created = await NewsComment.create(
      { newsPostId, userId, text: String(text).trim() },
      { transaction: t }
    );

    post.commentCount += 1;
    await post.save({ transaction: t });

    await t.commit();
    return res.status(201).json({ success: true, message: "Comment added", data: created });
  } catch (err) {
    await t.rollback();
    console.error("addComment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/news/:id/comments
exports.listComments = async (req, res) => {
  try {
    const newsPostId = Number(req.params.id);
    const items = await NewsComment.findAll({
      where: { newsPostId },
      order: [["createdAt", "DESC"]],
    });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error("listComments error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/news/:id/share
 * increments shareCount
 */
exports.shareNews = async (req, res) => {
  try {
    const newsPostId = Number(req.params.id);
    const post = await NewsPost.findByPk(newsPostId);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });

    post.shareCount += 1;
    await post.save();

    return res.json({ success: true, message: "Shared", data: { shareCount: post.shareCount } });
  } catch (err) {
    console.error("shareNews error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};