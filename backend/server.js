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

// Cloudinary (health check)
const cloudinary = require("./config/cloudinary");

// Verify email transporter (non-blocking, logs warning on failure)
verifyTransport().catch((err) => {
  console.warn("Email transporter verification failed at startup:", err && err.message ? err.message : err);
});

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
 * (still useful even when using Cloudinary because multer stores files locally first)
 */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/**
 * Routes
 */
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);

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
 * 404 Handler (for unknown routes)
 */
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/**
 * Global error handler (prevents crash / ECONNRESET)
 */
app.use((err, _req, res, _next) => {
  console.error("❌ Unhandled error:", err);
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/**
 * Start server (DB first, then listen)
 */
async function start() {
  try {
    await connectDB();

    // DEV ONLY: updates tables to match models without dropping data
    await sequelize.sync({ alter: true });

    console.log("✅ Database synced");

    await ensureDefaultAdmin();

    const PORT = Number(process.env.PORT) || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();