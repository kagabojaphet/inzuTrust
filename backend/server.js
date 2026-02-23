require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");

const { sequelize, connectDB } = require("./config/database");
const User = require("./model/userModel");

// Routes
const userRoutes = require("./router/userRoutes");
const propertyRoutes = require("./router/propertyRoutes");
const contactRoutes = require("./router/contactRoutes");
const newsRoutes = require("./router/newsRoutes"); // ✅ added

// Cloudinary (health check)
const cloudinary = require("./config/cloudinary");

const app = express();

/**
 * Validate critical env vars early
 */
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not set in .env");
  process.exit(1);
}

/**
 * Middlewares
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Static folder for uploads
 */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/**
 * Routes
 */
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/news", newsRoutes); // ✅ added here

app.get("/", (_req, res) => {
  res.send("API is running...");
});

/**
 * Cloudinary test route
 */
app.get("/cloudinary-test", async (_req, res) => {
  try {
    const result = await cloudinary.api.ping();
    return res.json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Ensure default admin exists
 */
async function ensureDefaultAdmin() {
  const defaultAdmin = {
    firstName: "mudage",
    lastName: "bruno",
    email: "mudagebruno76@gmail.com",
    password: "mudagel4@1",
    phone: "07323435781",
    role: "admin",
    nationalId: "120677078890",
  };

  const existing = await User.findOne({ where: { email: defaultAdmin.email } });
  if (existing) {
    console.log("✅ Default admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);

  await User.create({
    ...defaultAdmin,
    password: hashedPassword,
    isVerified: true,
  });

  console.log("✅ Default admin created");
}

/**
 * 404 Handler
 */
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/**
 * Global error handler
 */
app.use((err, _req, res, _next) => {
  console.error("❌ Unhandled error:", err);
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/**
 * Start server
 */
async function start() {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });

    console.log("✅ Database synced");

    await ensureDefaultAdmin();

    const PORT = Number(process.env.PORT) || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();