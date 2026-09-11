const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  getAdminStats,
  getUsers,
  deleteUser,
  getUserPosts,
  deletePost,
  getOrganizations,
  deleteOrganization,
  getOrganizationJobs,
  deleteJob,
  getAllPosts,
  getAllJobs,
  broadcastNotification,
  toggleVerifyUser,
  sendCustomEmail,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public admin login
router.post("/login", loginAdmin);

// Protected admin-only routes
router.use(protect, adminOnly);

router.get("/stats", getAdminStats);

// CareerVerse Verification Badge
router.put("/verify/:id", toggleVerifyUser);

// Candidate users
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.get("/users/:id/posts", getUserPosts);

// Organizations
router.get("/organizations", getOrganizations);
router.delete("/organizations/:id", deleteOrganization);
router.get("/organizations/:id/jobs", getOrganizationJobs);

// Content moderation
router.get("/posts", getAllPosts);
router.delete("/posts/:id", deletePost);

router.get("/jobs", getAllJobs);
router.delete("/jobs/:id", deleteJob);

// System broadcasts & Custom emails
router.post("/broadcast", broadcastNotification);
router.post("/send-email", sendCustomEmail);

module.exports = router;
