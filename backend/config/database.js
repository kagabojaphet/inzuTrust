require("dotenv").config();
const { Sequelize } = require("sequelize");

// Validate required environment variables
const requiredEnvVars = ["DB_NAME", "DB_USER", "DB_HOST"];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || "", // allow empty password (XAMPP)
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // disable SQL logs (set true if debugging)
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test connection function (optional but recommended)
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };