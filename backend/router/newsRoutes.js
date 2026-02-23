// router/newsRoutes.js
const router = require("express").Router();
const newsController = require("../controllers/newsController");
const { createNewsValidation } = require("../validator/newsValidation");

// const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", newsController.listNews);
router.get("/:id", newsController.getNewsById);

// admin/manager
router.post("/", /*protect, authorize("ADMIN","MANAGER"),*/ createNewsValidation, newsController.createNews);
router.patch("/:id", /*protect, authorize("ADMIN","MANAGER"),*/ newsController.updateNews);
router.delete("/:id", /*protect, authorize("ADMIN","MANAGER"),*/ newsController.deleteNews);

// user actions (need auth)
router.post("/:id/react", /*protect,*/ newsController.reactToNews);
router.get("/:id/comments", newsController.listComments);
router.post("/:id/comments", /*protect,*/ newsController.addComment);
router.post("/:id/share", newsController.shareNews);

module.exports = router;