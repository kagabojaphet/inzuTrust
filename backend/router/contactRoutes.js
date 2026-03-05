// router/contactRoutes.js
const express = require("express");
const router = express.Router();

const { submitContact } = require("../controllers/contactController");

// Public: Contact us
router.post("/", submitContact);

module.exports = router;