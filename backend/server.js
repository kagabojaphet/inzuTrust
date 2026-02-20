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
 * Static folder for uploads (still useful even if you later use Cloudinary,
 * because multer temporarily stores files locally)
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
 * Global error handler (prevents server crash and ECONNRESET)
 */
app.use((err, _req, res, _next) => {
  console.error("❌ Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
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
 * Start server (DB first, then listen)
 */
async function start() {
  await connectDB();          // uses your polished database.js
  await sequelize.sync();     // sync models (consider migrations later)

  console.log("✅ Database synced");

  await ensureDefaultAdmin();

  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
const cloudinary = require("./config/cloudinary");

app.get("/cloudinary-test", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});