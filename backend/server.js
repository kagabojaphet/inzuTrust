require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./model/index");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", require("./router/userRoutes"));
app.use("/api/properties", require("./router/propertyRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "InzuTrust API Running" });
});

// Initialization Logic
const startServer = async () => {
  try {
    // 1. Authenticate
    await db.sequelize.authenticate();
    console.log("✔ MySQL Connected...");

    // 2. Sync Parent Table first (Solves the 'users table doesn't exist' error)
    await db.User.sync({ force: true }); 
    console.log("✔ User table initialized.");

    // 3. Sync Child Tables
    await db.Property.sync({ force: true });
    console.log("✔ Property table initialized.");

    // 4. Final Sync for Associations
    await db.sequelize.sync();
    console.log("✔ All associations ready.");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server flying on port ${PORT}`);
    });
  } catch (err) {
    console.error("✘ Server failed to start:", err.message);
    process.exit(1);
  }
};

startServer();
