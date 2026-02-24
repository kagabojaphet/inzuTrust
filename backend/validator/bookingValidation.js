// validator/bookingValidation.js
const { body } = require("express-validator");

exports.createBookingValidation = [
  body("propertyId").notEmpty().isInt({ min: 1 }).withMessage("propertyId is required"),
  body("type").optional().isIn(["VISIT", "CALL", "MEET"]).withMessage("Invalid type"),
  body("startTime").notEmpty().isISO8601().withMessage("startTime must be a valid date"),
  body("endTime").optional().isISO8601().withMessage("endTime must be a valid date"),
  body("note").optional().isString(),
  body("contactPhone").optional().isString(),
  body("meetingLocation").optional().isString(),
];

exports.updateBookingStatusValidation = [
  body("status")
    .notEmpty()
    .isIn(["APPROVED", "REJECTED", "CANCELLED", "COMPLETED"])
    .withMessage("Invalid status"),
];