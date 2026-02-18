const sequelize = require("../config/database");
const User = require("./userModel");
const Property = require("./propertyModel");

const db = {};
db.sequelize = sequelize;

db.User = User;
db.Property = Property;

// Associations
db.User.hasMany(db.Property, { foreignKey: "landlordId", as: "properties" });
db.Property.belongsTo(db.User, { foreignKey: "landlordId", as: "landlord" });

module.exports = db;
