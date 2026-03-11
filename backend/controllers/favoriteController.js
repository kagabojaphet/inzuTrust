// controllers/favoriteController.js
const Favorite = require("../model/favoriteModel");
const Property = require("../model/propertyModel");

const addFavorite = async (req, res) => {
  try {
    const propertyId = Number(req.params.propertyId);
    const userId = req.user.id;

    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const existing = await Favorite.findOne({
      where: { userId, propertyId },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Property already saved",
      });
    }

    const favorite = await Favorite.create({
      userId,
      propertyId,
    });

    return res.status(201).json({
      success: true,
      message: "Property added to favorites",
      data: favorite,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.findAll({
      where: { userId },
      include: [
        {
          model: Property,
          as: "property",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const propertyId = Number(req.params.propertyId);
    const userId = req.user.id;

    const favorite = await Favorite.findOne({
      where: { userId, propertyId },
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    await favorite.destroy();

    return res.json({
      success: true,
      message: "Property removed from favorites",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addFavorite,
  getMyFavorites,
  removeFavorite,
};