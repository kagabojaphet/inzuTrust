const Property = require("../model/propertyModel");

// Helper: remove undefined keys so updates don't wipe fields
const cleanUndefined = (obj) => {
  const cleaned = {};
  Object.keys(obj || {}).forEach((k) => {
    if (obj[k] !== undefined) cleaned[k] = obj[k];
  });
  return cleaned;
};

// Helper: normalize numeric inputs (form-data sends strings)
const normalizePayload = (payload) => {
  const p = { ...payload };

  if (p.rentAmount !== undefined && p.rentAmount !== null && p.rentAmount !== "")
    p.rentAmount = Number(p.rentAmount);

  if (p.bedrooms !== undefined && p.bedrooms !== null && p.bedrooms !== "")
    p.bedrooms = Number(p.bedrooms);

  if (p.bathrooms !== undefined && p.bathrooms !== null && p.bathrooms !== "")
    p.bathrooms = Number(p.bathrooms);

  return p;
};

const createProperty = async (landlordId, payload) => {
  const normalized = normalizePayload(payload);

  const created = await Property.create({
    ...normalized,
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

  if (property.landlordId !== landlordId) {
    throw new Error("Not authorized to update this property");
  }

  // normalize + don't overwrite with undefined
  const normalized = normalizePayload(updates);
  const safeUpdates = cleanUndefined(normalized);

  // OPTIONAL: if you want to MERGE images instead of replacing, uncomment:
  // if (safeUpdates.images && Array.isArray(safeUpdates.images)) {
  //   const existing = Array.isArray(property.images) ? property.images : [];
  //   safeUpdates.images = [...existing, ...safeUpdates.images];
  // }

  await property.update(safeUpdates);
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