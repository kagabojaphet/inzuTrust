// controllers/propertyReviewController.js
const reviewService = require("../services/propertyReviewService");

// POST /api/properties/:id/reviews
const addReview = async (req, res) => {
  try {
    const review = await reviewService.upsertReview(
      req.user.id,
      req.params.id,
      req.body
    );
    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/properties/:id/reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsByProperty(req.params.id);
    return res.json({ success: true, data: reviews });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

// DELETE /api/properties/:propertyId/reviews/:reviewId
const deleteReview = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    await reviewService.deleteReview(req.params.reviewId, req.user.id, isAdmin);
    return res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { addReview, getReviews, deleteReview };