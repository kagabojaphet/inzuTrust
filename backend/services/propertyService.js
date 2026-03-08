
const { Op } = require("sequelize");
const Property = require("../model/propertyModel");

const createProperty = async (landlordId, payload) => {
  const data = {
    ...payload,
    landlordId,
  };

  if (data.rentAmount !== undefined && data.rentAmount !== null) {
    data.rentAmount = Number(data.rentAmount);
  }
  if (data.bedrooms !== undefined && data.bedrooms !== null) {
    data.bedrooms = Number(data.bedrooms);
  }
  if (data.bathrooms !== undefined && data.bathrooms !== null) {
    data.bathrooms = Number(data.bathrooms);
  }

  const created = await Property.create(data);
  return created;
};

const getAllProperties = async (query) => {
  const {
    district,
    type,
    minRent,
    maxRent,
    bedrooms,
    bathrooms,
    status,
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "DESC",
  } = query;

  const where = {};

  if (district) {
    where.district = district;
  }

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  if (bedrooms) {
    where.bedrooms = Number(bedrooms);
  }

  if (bathrooms) {
    where.bathrooms = Number(bathrooms);
  }

  if (minRent || maxRent) {
    where.rentAmount = {};

    if (minRent) {
      where.rentAmount[Op.gte] = Number(minRent);
    }

    if (maxRent) {
      where.rentAmount[Op.lte] = Number(maxRent);
    }
  }

  const allowedSortFields = ["createdAt", "rentAmount", "bedrooms", "bathrooms", "district"];
  const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";
  const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

  const currentPage = Number(page) || 1;
  const perPage = Number(limit) || 10;
  const offset = (currentPage - 1) * perPage;

  const { count, rows } = await Property.findAndCountAll({
    where,
    order: [[sortField, sortOrder]],
    limit: perPage,
    offset,
  });

  return {
    total: count,
    page: currentPage,
    limit: perPage,
    totalPages: Math.ceil(count / perPage),
    properties: rows,
  };
};

const getPropertyById = async (id) => {
  const property = await Property.findByPk(id);
  if (!property) throw new Error("Property not found");
  return property;
};

const getMyProperties = async (landlordId) => {
  return Property.findAll({
    where: { landlordId },
    order: [["createdAt", "DESC"]],
  });
};

const updateProperty = async (id, landlordId, updates) => {
  const property = await Property.findByPk(id);
  if (!property) throw new Error("Property not found");

  if (property.landlordId !== landlordId) {
    throw new Error("Not authorized to update this property");
  }

  const data = { ...updates };

  if (data.rentAmount !== undefined && data.rentAmount !== null) {
    data.rentAmount = Number(data.rentAmount);
  }
  if (data.bedrooms !== undefined && data.bedrooms !== null) {
    data.bedrooms = Number(data.bedrooms);
  }
  if (data.bathrooms !== undefined && data.bathrooms !== null) {
    data.bathrooms = Number(data.bathrooms);
  }

  await property.update(data);
  return property;
};

const deleteProperty = async (id, landlordId) => {
  const property = await Property.findByPk(id);
  if (!property) throw new Error("Property not found");

  if (property.landlordId !== landlordId) {
    throw new Error("Not authorized to delete this property");
  }

  await property.destroy();
  return true;
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
};