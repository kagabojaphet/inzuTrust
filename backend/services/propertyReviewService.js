const { PropertyReview, Property, User } = require("../model");
const { Sequelize } = require("sequelize");

// ── Create or update a review ────────────────────────────────────────────────
const upsertReview = async (tenantId, propertyId, { rating, comment }) => {
  const stars = Number(rating);

  if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const property = await Property.findByPk(propertyId);
  if (!property) throw new Error("Property not found");

  const [review, created] = await PropertyReview.findOrCreate({
    where: { propertyId, tenantId },
    defaults: {
      rating: stars,
      comment: comment?.trim() || null,
    },
  });

  if (!created) {
    await review.update({
      rating: stars,
      comment: comment?.trim() || null,
    });
  }

  await recalcRating(propertyId);

  return review;
};

// ── Get all reviews for a property ───────────────────────────────────────────
const getReviewsByProperty = async (propertyId) => {
  const property = await Property.findByPk(propertyId);
  if (!property) throw new Error("Property not found");

  return PropertyReview.findAll({
    where: { propertyId },
    include: [
      {
        model: User,
        as: "reviewer",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

// ── Delete review ────────────────────────────────────────────────────────────
const deleteReview = async (reviewId, tenantId, isAdmin = false) => {
  const review = await PropertyReview.findByPk(reviewId);
  if (!review) throw new Error("Review not found");

  if (!isAdmin && review.tenantId !== tenantId) {
    throw new Error("Not authorized to delete this review");
  }

  const propertyId = review.propertyId;

  await review.destroy();
  await recalcRating(propertyId);

  return true;
};

// ── Recalculate rating (OPTIMIZED - no full table scan) ──────────────────────
const recalcRating = async (propertyId) => {
  const result = await PropertyReview.findOne({
    where: { propertyId },
    attributes: [
      [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      [Sequelize.fn("AVG", Sequelize.col("rating")), "avg"],
    ],
    raw: true,
  });

  const count = Number(result.count || 0);
  const avg = Number(result.avg || 0);

  await Property.update(
    {
      rating: parseFloat(avg.toFixed(2)),
      reviewCount: count,
    },
    {
      where: { id: propertyId },
    }
  );
};

module.exports = {
  upsertReview,
  getReviewsByProperty,
  deleteReview,
};