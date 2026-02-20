const Property = require("../model/propertyModel");

const createProperty = async (landlordId, payload) => {
  const created = await Property.create({
    ...payload,
    landlordId,
  });
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

  // Only owner landlord (or admin if you add that logic later)
  if (property.landlordId !== landlordId) {
    throw new Error("Not authorized to update this property");
  }

  await property.update(updates);
  return property;
};

const deleteProperty = async (id, landlordId) => {
  const property = await Property.findByPk(id);
  if (!property) throw new Error("Property not found");

  if (property.landlordId !== landlordId) {
    throw new Error("Not authorized to delete this property");
  }

  await property.destroy();
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
};
