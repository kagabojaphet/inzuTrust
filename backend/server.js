const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
const path    = require("path");
const db      = require("./model/index");

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/users",              require("./router/userRoutes"));
app.use("/api/properties",         require("./router/propertyRoutes"));
app.use("/api/contact",            require("./router/contactRoutes"));
app.use("/api/news",               require("./router/newsRoutes"));
app.use("/api/favorites",          require("./router/favoriteRoutes"));
app.use("/api/viewing-requests",   require("./router/viewingRequestRoutes"));
app.use("/api/lease-applications", require("./router/leaseApplicationRoutes"));
app.use("/api/agreements",         require("./router/agreementRoutes"));
app.use("/api/payments",           require("./router/paymentRoutes"));
app.use("/api/disputes",           require("./router/disputeRoutes"));
app.use("/api/messages",           require("./router/messageRoutes"));
app.use("/api/notifications",      require("./router/notificationRoutes"));
app.use("/api/trust-score",        require("./router/trustScoreRoutes"));
app.use("/api/admin",              require("./router/adminRoutes"));
app.use("/api/calls",              require("./router/callRoutes"));
app.use("/api/meetings",           require("./router/meetingRoutes"));
app.use("/api/agents",             require("./router/agentRoutes"));
app.use("/api/maintenance",        require("./router/maintenanceRoutes"));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "InzuTrust API Running" }));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✔ MySQL Connected...");

    // alter:true adds new columns/tables without dropping existing data
    // NEVER use force:true in production — it deletes all data
    await db.sequelize.sync({ alter: true });
    console.log("✔ Database synced — all new tables created.");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("✘ Server failed to start:", err.message);
    process.exit(1);
  }
};

startServer();