const sequelize = require("../config/database");
const User = require("./userModel");
const Property = require("./propertyModel");

const db = {};

db.sequelize = sequelize;
db.User = User;
db.Property = Property;

// Define Relationships
// A Landlord (User) has many Properties
db.User.hasMany(db.Property, { 
  foreignKey: "landlordId", 
  as: "ownedProperties",
  onDelete: "CASCADE" 
});

// A Property belongs to a Landlord (User)
db.Property.belongsTo(db.User, { 
  foreignKey: "landlordId", 
  as: "landlord" 
});

module.exports = db;