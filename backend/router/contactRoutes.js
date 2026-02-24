// router/contactRoutes.js
const router = require("express").Router();
const contactController = require("../controllers/contactController");
const { contactValidation } = require("../validator/contactValidation");

// If you have auth middleware, protect admin routes:
// const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", contactValidation, contactController.createContactMessage);

// admin/manager
router.get("/", /*protect, authorize("ADMIN","MANAGER"),*/ contactController.getAllContactMessages);
router.patch("/:id/status", /*protect, authorize("ADMIN","MANAGER"),*/ contactController.updateContactStatus);

module.exports = router;