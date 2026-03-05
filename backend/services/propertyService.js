// services/propertyService.js
const Property = require("../model/propertyModel");

const createProperty = async (landlordId, payload) => {
  // cast numeric fields that can arrive as strings from form-data
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

const getAllProperties = async () => {
  return Property.findAll({ order: [["createdAt", "DESC"]] });
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

  // cast when updating too
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