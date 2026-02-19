const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/database");

dotenv.config();

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
    return sequelize.sync({ force: true }); // Force sync to recreate tables with new columns
  })
  .then(() => {
    console.log("Database synced...");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log("Database error:", err));
