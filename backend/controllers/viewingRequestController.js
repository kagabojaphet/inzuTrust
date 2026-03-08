// controllers/viewingRequestController.js
const ViewingRequest = require("../model/viewingRequestModel");
const Property = require("../model/propertyModel");

// Tenant creates request
const createViewingRequest = async (req, res) => {
  try {
    const { propertyId, preferredDateTime, message } = req.body;

    if (!propertyId || !preferredDateTime) {
      return res.status(400).json({
        success: false,
        message: "propertyId and preferredDateTime are required",
      });
    }

    const property = await Property.findByPk(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // tenant should not request their own property
    if (property.landlordId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot request viewing for your own property",
      });
    }

    const created = await ViewingRequest.create({
      tenantId: req.user.id,
      landlordId: property.landlordId,
      propertyId,
      preferredDateTime,
      message: message || null,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Viewing request created successfully",
      data: created,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Tenant views their own requests
const getMyViewingRequests = async (req, res) => {
  try {
    const requests = await ViewingRequest.findAll({
      where: { tenantId: req.user.id },
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
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Landlord views requests for their properties
const getLandlordViewingRequests = async (req, res) => {
  try {
    const requests = await ViewingRequest.findAll({
      where: { landlordId: req.user.id },
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
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Landlord updates request status
const updateViewingRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be accepted or rejected",
      });
    }

    const viewingRequest = await ViewingRequest.findByPk(requestId);

    if (!viewingRequest) {
      return res.status(404).json({
        success: false,
        message: "Viewing request not found",
      });
    }

    if (viewingRequest.landlordId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this request",
      });
    }

    viewingRequest.status = status;
    await viewingRequest.save();

    return res.json({
      success: true,
      message: `Viewing request ${status}`,
      data: viewingRequest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createViewingRequest,
  getMyViewingRequests,
  getLandlordViewingRequests,
  updateViewingRequestStatus,
};