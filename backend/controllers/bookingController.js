// controllers/bookingController.js
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

const Booking = require("../model/bookingModel");
const Property = require("../model/propertyModel"); // adjust path/name to your property model
const { notify } = require("../services/notificationService"); // ✅ ADD

// Tenant creates booking request
// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const tenantId = req.user?.id;
    if (!tenantId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const {
      propertyId,
      type = "VISIT",
      startTime,
      endTime,
      note,
      contactPhone,
      meetingLocation,
    } = req.body;

    const property = await Property.findByPk(propertyId);
    if (!property)
      return res.status(404).json({ success: false, message: "Property not found" });

    // IMPORTANT: adjust this based on your property schema
    // Many systems store landlordId/ownerId on property
    const landlordId = property.landlordId || property.ownerId || property.userId;
    if (!landlordId) {
      return res.status(400).json({
        success: false,
        message: "Property has no landlord assigned (missing landlordId/ownerId/userId)",
      });
    }

    if (Number(landlordId) === Number(tenantId)) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot book your own property" });
    }

    // Simple clash check: same property, overlapping start/end, and not cancelled/rejected
    // If endTime is missing, we treat it as 1 hour booking
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 60 * 60 * 1000);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ success: false, message: "Invalid startTime/endTime" });
    }

    const clash = await Booking.findOne({
      where: {
        propertyId,
        status: { [Op.in]: ["PENDING", "APPROVED"] },
        // overlap condition
        startTime: { [Op.lt]: end },
        endTime: { [Op.gt]: start },
      },
    });

    if (clash) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked. Choose another time.",
      });
    }

    const created = await Booking.create({
      propertyId,
      tenantId,
      landlordId,
      type,
      status: "PENDING",
      startTime: start,
      endTime: end,
      note: note || null,
      contactPhone: contactPhone || null,
      meetingLocation: meetingLocation || null,
    });

    // ✅ NOTIFICATION: landlord gets notified
    await notify(landlordId, {
      type: "BOOKING_REQUESTED",
      title: "New booking request",
      message: `You have a new ${String(type).toLowerCase()} request for property #${propertyId}.`,
      data: {
        bookingId: created.id,
        propertyId: Number(propertyId),
        tenantId: Number(tenantId),
        startTime: created.startTime,
        endTime: created.endTime,
      },
    });

    return res.status(201).json({ success: true, message: "Booking requested", data: created });
  } catch (err) {
    console.error("createBooking error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Tenant: list my bookings
// GET /api/bookings/my
exports.listMyBookings = async (req, res) => {
  try {
    const tenantId = req.user?.id;
    if (!tenantId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const items = await Booking.findAll({
      where: { tenantId },
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, data: items });
  } catch (err) {
    console.error("listMyBookings error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Landlord/Admin: list bookings for my properties
// GET /api/bookings/landlord
exports.listLandlordBookings = async (req, res) => {
  try {
    const landlordId = req.user?.id;
    if (!landlordId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const items = await Booking.findAll({
      where: { landlordId },
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, data: items });
  } catch (err) {
    console.error("listLandlordBookings error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Landlord/Admin: approve or reject
// PATCH /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const { status } = req.body;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const role = (req.user?.role || "").toString().toUpperCase();

    // Only landlord of that booking or ADMIN can approve/reject/complete
    const isOwnerLandlord = Number(booking.landlordId) === Number(userId);
    const isAdmin = role === "ADMIN";

    // Tenant can only CANCEL their own booking
    if (!isOwnerLandlord && !isAdmin) {
      if (status === "CANCELLED" && Number(booking.tenantId) === Number(userId)) {
        booking.status = "CANCELLED";
        await booking.save();

        // ✅ NOTIFICATION: landlord gets notified tenant cancelled
        await notify(booking.landlordId, {
          type: "BOOKING_CANCELLED",
          title: "Booking cancelled",
          message: "A tenant cancelled a booking request.",
          data: {
            bookingId: booking.id,
            propertyId: booking.propertyId,
            tenantId: booking.tenantId,
            startTime: booking.startTime,
            endTime: booking.endTime,
          },
        });

        return res.json({ success: true, message: "Booking cancelled", data: booking });
      }

      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    // Landlord/Admin logic
    if (["APPROVED", "REJECTED", "COMPLETED", "CANCELLED"].includes(status)) {
      booking.status = status;
      await booking.save();

      // ✅ NOTIFICATIONS based on status
      if (status === "APPROVED") {
        await notify(booking.tenantId, {
          type: "BOOKING_APPROVED",
          title: "Booking approved",
          message: "Your booking request has been approved.",
          data: {
            bookingId: booking.id,
            propertyId: booking.propertyId,
            landlordId: booking.landlordId,
            startTime: booking.startTime,
            endTime: booking.endTime,
          },
        });
      }

      if (status === "REJECTED") {
        await notify(booking.tenantId, {
          type: "BOOKING_REJECTED",
          title: "Booking rejected",
          message: "Your booking request has been rejected.",
          data: {
            bookingId: booking.id,
            propertyId: booking.propertyId,
            landlordId: booking.landlordId,
            startTime: booking.startTime,
            endTime: booking.endTime,
          },
        });
      }

      if (status === "CANCELLED") {
        // landlord/admin cancelled -> notify tenant
        await notify(booking.tenantId, {
          type: "BOOKING_CANCELLED",
          title: "Booking cancelled",
          message: "Your booking request was cancelled.",
          data: {
            bookingId: booking.id,
            propertyId: booking.propertyId,
            landlordId: booking.landlordId,
            startTime: booking.startTime,
            endTime: booking.endTime,
          },
        });
      }

      if (status === "COMPLETED") {
        await notify(booking.tenantId, {
          type: "BOOKING_COMPLETED",
          title: "Booking completed",
          message: "Your booking has been marked as completed.",
          data: {
            bookingId: booking.id,
            propertyId: booking.propertyId,
            landlordId: booking.landlordId,
            startTime: booking.startTime,
            endTime: booking.endTime,
          },
        });
      }

      return res.json({ success: true, message: "Status updated", data: booking });
    }

    return res.status(400).json({ success: false, message: "Invalid status" });
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};