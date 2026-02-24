// router/bookingRoutes.js
const router = require("express").Router();
const bookingController = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
const {
  createBookingValidation,
  updateBookingStatusValidation,
} = require("../validator/bookingValidation");

// tenant creates booking
router.post("/", protect, createBookingValidation, bookingController.createBooking);

// tenant view own bookings
router.get("/my", protect, bookingController.listMyBookings);

// landlord/admin view incoming bookings
router.get("/landlord", protect, bookingController.listLandlordBookings);

// landlord/admin approve/reject/complete OR tenant cancel
router.patch("/:id/status", protect, updateBookingStatusValidation, bookingController.updateBookingStatus);

module.exports = router;