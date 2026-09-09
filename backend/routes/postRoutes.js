const express = require("express");
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  sharePost,
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

// Optional protect helper so unauthenticated feed browsing still works
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    return protect(req, res, next);
  }
  next();
};

router.get("/", optionalProtect, getPosts);
router.post("/", protect, createPost);
router.get("/:id", getPostById);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comments", protect, addComment);
router.post("/:id/share", optionalProtect, sharePost);

module.exports = router;
