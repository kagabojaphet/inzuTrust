// validator/contactValidation.js
const { body } = require("express-validator");

exports.contactValidation = [
  body("fullName").trim().notEmpty().withMessage("fullName is required"),
  body("subject").trim().notEmpty().withMessage("subject is required"),
  body("message").trim().notEmpty().withMessage("message is required"),
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("phone").optional().isString(),
];