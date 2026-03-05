const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
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
app.use("/api/contact", require("./router/contactRoutes"));
app.use("/api/news", require("./router/newsRoutes"));


app.get("/", (req, res) => {
  res.json({ message: "InzuTrust API Running" });
});

// Initialization Logic
const startServer = async () => {
  try {
    // 1. Authenticate
    await db.sequelize.authenticate();
    console.log("✔ MySQL Connected...");

    // i removed the forcre: true option to prevent data loss during development.
   await db.sequelize.sync();
console.log("✔ Database synced.");

  
    await db.sequelize.sync();
console.log("✔ Database synced.");

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