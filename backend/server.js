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
const { verifyTransport } = require("./services/emailService");

if (!process.env.JWT_SECRET) {
  console.error(
    "Environment variable JWT_SECRET is not set. Set JWT_SECRET in .env."
  );
  process.exit(1);
}

// Verify email transporter (non-blocking, logs warning on failure)
verifyTransport().catch((err) => {
  console.warn("Email transporter verification failed at startup:", err && err.message ? err.message : err);
});

const app = express();

app.use(cors());
app.use(express.json());

const bcrypt = require("bcryptjs");
const User = require("./model/userModel");

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
    return sequelize.sync({ alter: true });
  })
  .then(async () => {
    console.log("Database synced...");

    // Ensure default admin exists
    const defaultAdmin = {
      firstName: "mudage",
      lastName: "bruno",
      email: "mudagebruno76@gmail.com",
      password: "mudagel4@1",
      phone: "07323435781",
      role: "admin",
      nationalId: "120677078890",
    };

    try {
      const existing = await User.findOne({
        where: { email: defaultAdmin.email },
      });
      if (existing) {
        console.log("Default admin already exists:", defaultAdmin.email);
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(defaultAdmin.password, salt);
        await User.create({
          firstName: defaultAdmin.firstName,
          lastName: defaultAdmin.lastName,
          email: defaultAdmin.email,
          password: hashed,
          phone: defaultAdmin.phone,
          role: defaultAdmin.role,
          nationalId: defaultAdmin.nationalId,
          isVerified: true,
        });
        console.log("Default admin created:", defaultAdmin.email);
      }
    } catch (err) {
      console.error("Error ensuring default admin:", err.message || err);
    }

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log("Database error:", err));
