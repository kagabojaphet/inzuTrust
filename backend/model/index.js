const sequelize = require("../config/database");
const User = require("./userModel");

const db = {};
db.sequelize = sequelize;
db.User = User;

module.exports = db;
