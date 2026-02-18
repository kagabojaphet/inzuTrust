const { Sequelize } = require("sequelize");
require("dotenv").config();

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } = process.env;

if (!DB_NAME || !DB_USER) {
  console.error(
    "Missing database environment variables. Please set DB_NAME and DB_USER in .env"
  );
  console.error(
    `Current values -> DB_NAME: ${DB_NAME || "<empty>"}, DB_USER: ${DB_USER || "<empty>"}`
  );
  process.exit(1);
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST || "localhost",
  dialect: "mysql",
  logging: false,
});

module.exports = sequelize;
