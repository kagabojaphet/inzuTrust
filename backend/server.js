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
app.use("/api/favorites", require("./router/favoriteRoutes"));
app.use("/api/viewing-requests", require("./router/viewingRequestRoutes"));


app.get("/", (req, res) => {
  res.json({ message: "InzuTrust API Running" });
});

// Initialization Logic
const startServer = async () => {
  try {
    // 1. Authenticate
    await db.sequelize.authenticate();
    console.log("✔ MySQL Connected...");

    // 2. FORCE SYNC (Change this part)
    // Using { alter: true } will attempt to update the column type automatically.
    // If it fails due to existing data, use { force: true } ONCE to reset the table.
    await db.sequelize.sync({ alter: true }); 
    console.log("✔ Database synced and schema updated to UUID.");

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