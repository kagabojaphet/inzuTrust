// router/callRoutes.js
const router = require("express").Router();
const { createRoom, createToken } = require("../controllers/callController");
const { protect } = require("../middleware/authMiddleware");

router.post("/room",  protect, createRoom);
router.post("/token", protect, createToken);

module.exports = router;