// routes/messageRoutes.js
const router = require("express").Router();
const ctrl   = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.get("/conversations",          protect, ctrl.getConversations);
router.get("/contacts/available",     protect, ctrl.getAvailableContacts);
router.get("/:contactId",             protect, ctrl.getThread);
router.post("/",                      protect, ctrl.send);
router.delete("/:id",                 protect, ctrl.remove);

module.exports = router;