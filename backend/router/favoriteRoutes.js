// router/favoriteRoutes.js
const express = require("express");
const router = express.Router();

const {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} = require("../controllers/favoriteController");

const { protect } = require("../middleware/authMiddleware");

router.post("/:propertyId", protect, addFavorite);
router.get("/", protect, getMyFavorites);
router.delete("/:propertyId", protect, removeFavorite);

module.exports = router;