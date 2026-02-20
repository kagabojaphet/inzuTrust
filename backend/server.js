const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const sequelize = require("./config/database");
const bcrypt = require("bcryptjs");
const User = require("./model/userModel");

// Import routes
const userRoutes = require("./router/userRoutes");
const propertyRoutes = require("./router/propertyRoutes");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set in .env");
  process.exit(1);
}

// Verify email transporter (non-blocking, logs warning on failure)
verifyTransport().catch((err) => {
  console.warn("Email transporter verification failed at startup:", err && err.message ? err.message : err);
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // ✅ only once
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected...");
    return sequelize.sync({ force: true }); // Force sync to recreate tables with new columns
  })
  .then(async () => {
    console.log("Database synced...");

    // Default Admin
    const defaultAdmin = {
      firstName: "mudage",
      lastName: "bruno",
      email: "mudagebruno76@gmail.com",
      password: "mudagel4@1",
      phone: "07323435781",
      role: "admin",
      nationalId: "120677078890",
    };

    const existing = await User.findOne({
      where: { email: defaultAdmin.email },
    });

    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultAdmin.password, salt);

      await User.create({
        ...defaultAdmin,
        password: hashedPassword,
        isVerified: true,
      });

      console.log("Default admin created");
    } else {
      console.log("Default admin already exists");
    }

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log("Database error:", err));
