const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

console.log("env summary:", {
  DB_NAME: process.env.DB_NAME ? "<set>" : "<missing>",
  DB_USER: process.env.DB_USER ? "<set>" : "<missing>",
  DB_PASSWORD: process.env.DB_PASSWORD ? "<set>" : "<missing>",
  DB_HOST: process.env.DB_HOST ? "<set>" : "<missing>",
  JWT_SECRET: process.env.JWT_SECRET ? "<set>" : "<missing>",
});

const sequelize = require("./config/database");

if (!process.env.JWT_SECRET) {
  console.error(
    "Environment variable JWT_SECRET is not set. Set JWT_SECRET in .env."
  );
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require("./router/userRoutes");

// Use routes
app.use("/api/users", userRoutes);

// Test route (optional)
app.get("/", (req, res) => {
  res.send("API is running...");
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected...");
    return sequelize.sync();
  })
  .then(() => {
    console.log("Database synced...");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log("Database error:", err));
