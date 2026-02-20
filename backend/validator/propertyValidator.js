const { body } = require("express-validator");

const createPropertyValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("type")
    .optional()
    .isIn(["house", "apartment", "room", "land", "commercial"])
    .withMessage("Invalid property type"),
  body("district").trim().notEmpty().withMessage("District is required"),
  body("sector").optional().trim(),
  body("address").optional().trim(),
  body("rentAmount")
    .notEmpty()
    .withMessage("Rent amount is required")
    .isFloat({ min: 0 })
    .withMessage("Rent amount must be a number"),
  body("bedrooms").optional().isInt({ min: 0 }).withMessage("Bedrooms must be a number"),
  body("bathrooms").optional().isInt({ min: 0 }).withMessage("Bathrooms must be a number"),
  body("description").optional().trim(),
  body("status")
    .optional()
    .isIn(["available", "occupied"])
    .withMessage("Invalid status"),
];

const updatePropertyValidation = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("type")
    .optional()
    .isIn(["house", "apartment", "room", "land", "commercial"])
    .withMessage("Invalid property type"),
  body("district").optional().trim().notEmpty(),
  body("sector").optional().trim(),
  body("address").optional().trim(),
  body("rentAmount").optional().isFloat({ min: 0 }).withMessage("Rent amount must be a number"),
  body("bedrooms").optional().isInt({ min: 0 }),
  body("bathrooms").optional().isInt({ min: 0 }),
  body("description").optional().trim(),
  body("status").optional().isIn(["available", "occupied"]),
];

module.exports = { createPropertyValidation, updatePropertyValidation };
