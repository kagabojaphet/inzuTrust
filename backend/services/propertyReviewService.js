// services/propertyReviewService.js
const { PropertyReview, Property, User } = require("../model");

// ── Create or update a review ─────────────────────────────────────────────────
const upsertReview = async (tenantId, propertyId, { rating, comment }) => {
  // Validate rating
  const stars = Number(rating);
  if (!stars || stars < 1 || stars > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const property = await Property.findByPk(propertyId);
  if (!property) throw new Error("Property not found");

  // Upsert — one review per tenant per property
  const [review, created] = await PropertyReview.findOrCreate({
    where: { propertyId, tenantId },
    defaults: { rating: stars, comment: comment || null },
  });

  if (!created) {
    await review.update({ rating: stars, comment: comment || null });
  }

  // Recalculate aggregated rating on the property
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

// ── Delete a review (tenant deletes own, admin deletes any) ───────────────────
const deleteReview = async (reviewId, tenantId, isAdmin = false) => {
  const review = await PropertyReview.findByPk(reviewId);
  if (!review) throw new Error("Review not found");

  if (!isAdmin && review.tenantId !== tenantId) {
    throw new Error("Not authorized to delete this review");
  }

  const { propertyId } = review;
  await review.destroy();
  await recalcRating(propertyId);
  return true;
};

// ── Internal: recalculate and persist aggregated rating ───────────────────────
const recalcRating = async (propertyId) => {
  const reviews = await PropertyReview.findAll({ where: { propertyId } });
  const count   = reviews.length;
  const avg     = count
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
    : 0;

  await Property.update(
    { rating: parseFloat(avg.toFixed(2)), reviewCount: count },
    { where: { id: propertyId } }
  );
};

module.exports = { upsertReview, getReviewsByProperty, deleteReview };