// validator/newsValidation.js
const { body } = require("express-validator");

exports.createNewsValidation = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("body").trim().notEmpty().withMessage("body is required"),
  body("coverImage").optional().isString(),
  body("status").optional().isIn(["DRAFT", "PUBLISHED"]),
];