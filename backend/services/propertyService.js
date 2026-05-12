// services/propertyService.js
const { Op }        = require("sequelize");
const Property      = require("../model/propertyModel");
const AgentProperty = require("../model/agentProperty");

// ── Cast numeric fields from form-data strings ────────────────────────────────
const castNumeric = (data) => {
  const out = { ...data };
  if (out.rentAmount   != null) out.rentAmount   = Number(out.rentAmount);
  if (out.bedrooms     != null) out.bedrooms     = Number(out.bedrooms);
  if (out.bathrooms    != null) out.bathrooms    = Number(out.bathrooms);
  if (out.squareMeters != null) out.squareMeters = Number(out.squareMeters);
  return out;
};

// ── Create ────────────────────────────────────────────────────────────────────
// Three modes:
//   A. Landlord   → landlordId = self, createdByAgentId = null
//   B. Agent + landlordId in body → on behalf of landlord (needs canCreateProperty)
//   C. Agent, no landlordId → agent's own independent listing
const createProperty = async (actorId, actorRole, payload) => {
  const data = castNumeric({ ...payload });

  if (actorRole === "landlord") {
    data.landlordId       = actorId;
    data.createdByAgentId = null;

  } else if (actorRole === "agent") {

    if (data.landlordId) {
      // Mode B — verify canCreateProperty permission for this landlord
      const permission = await AgentProperty.findOne({
        where: {
          agentId:           actorId,
          assignedById:      data.landlordId,
          canCreateProperty: true,
          isActive:          true,
        },
      });
      if (!permission) {
        throw new Error("You do not have permission to create listings for this landlord");
      }
      data.createdByAgentId = actorId;

    } else {
      // Mode C — agent's own listing, no landlord
      data.landlordId       = null;
      data.createdByAgentId = actorId;
    }

  } else {
    throw new Error("Only landlords and agents can create properties");
  }

  const property = await Property.create(data);

  // Auto-assign agent so they can manage the property they just created
  if (actorRole === "agent") {
    await AgentProperty.create({
      agentId:              actorId,
      propertyId:           property.id,
      assignedById:         data.landlordId || actorId,
      canEditDetails:       true,
      canManageTenants:     false,
      canViewPayments:      false,
      canHandleMaintenance: false,
      canCreateProperty:    true,
      canViewTenants:       false,
      canRespondDisputes:   false,
      isActive:             true,
    });
  }

  return property;
};

// ── Get all (public, with filters) ────────────────────────────────────────────
const getAllProperties = async (query) => {
  const {
    district, type, minRent, maxRent,
    bedrooms, bathrooms, status, rentPeriod,
    page = 1, limit = 10,
    sort = "createdAt", order = "DESC",
  } = query;

  const where = {};
  if (district)   where.district   = district;
  if (type)       where.type       = type;
  if (status)     where.status     = status;
  if (rentPeriod) where.rentPeriod = rentPeriod;
  if (bedrooms)   where.bedrooms   = Number(bedrooms);
  if (bathrooms)  where.bathrooms  = Number(bathrooms);

  if (minRent || maxRent) {
    where.rentAmount = {};
    if (minRent) where.rentAmount[Op.gte] = Number(minRent);
    if (maxRent) where.rentAmount[Op.lte] = Number(maxRent);
  }

  const allowed   = ["createdAt", "rentAmount", "bedrooms", "bathrooms", "district", "rating"];
  const sortField = allowed.includes(sort) ? sort : "createdAt";
  const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage     = Math.min(Number(limit) || 10, 100);

  const { count, rows } = await Property.findAndCountAll({
    where,
    order:  [[sortField, sortOrder]],
    limit:  perPage,
    offset: (currentPage - 1) * perPage,
  });

  return {
    total: count, page: currentPage,
    limit: perPage, totalPages: Math.ceil(count / perPage),
    properties: rows,
  };
};

// ── Get one ───────────────────────────────────────────────────────────────────
const getPropertyById = async (id) => {
  const property = await Property.findByPk(id);
  if (!property) throw new Error("Property not found");
  return property;
};

// ── Landlord: their own listings ──────────────────────────────────────────────
const getMyProperties = async (landlordId) => {
  return Property.findAll({
    where: { landlordId },
    order: [["createdAt", "DESC"]],
  });
};

// ── Agent: listings they personally created (own + on-behalf-of) ──────────────
const getAgentOwnListings = async (agentId) => {
  return Property.findAll({
    where: { createdByAgentId: agentId },
    order: [["createdAt", "DESC"]],
  });
};

// ── Agent: properties a landlord ASSIGNED to them (not self-created) ──────────
const getAgentAssignedProperties = async (agentId) => {
  const assignments = await AgentProperty.findAll({
    where:   { agentId, isActive: true },
    include: [{ model: Property, as: "property" }],
    order:   [["createdAt", "DESC"]],
  });

  return assignments
    .filter((a) => a.property && a.property.createdByAgentId !== agentId)
    .map((a) => ({
      ...a.property.toJSON(),
      permissions: {
        canEditDetails:       a.canEditDetails,
        canManageTenants:     a.canManageTenants,
        canViewPayments:      a.canViewPayments,
        canHandleMaintenance: a.canHandleMaintenance,
        canCreateProperty:    a.canCreateProperty,
        canViewTenants:       a.canViewTenants,
        canRespondDisputes:   a.canRespondDisputes,
      },
    }));
};

// ── Update — canManageProperty middleware already verified access ──────────────
// Do NOT re-check landlordId here — agents would be blocked
const updateProperty = async (id, updates) => {
  const property = await Property.findByPk(id);
  if (!property) throw new Error("Property not found");
  await property.update(castNumeric(updates));
  return property;
};

// ── Delete (landlord only, enforced at route level) ───────────────────────────
const deleteProperty = async (id, landlordId) => {
  const property = await Property.findByPk(id);
  if (!property) throw new Error("Property not found");
  if (property.landlordId !== landlordId) throw new Error("Not authorized");
  await property.destroy();
  return true;
};

module.exports = {
  createProperty, getAllProperties, getPropertyById,
  getMyProperties, getAgentOwnListings, getAgentAssignedProperties,
  updateProperty, deleteProperty,
};