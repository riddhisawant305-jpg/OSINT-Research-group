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
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
  getAllFaqsAdmin,
  createFaq,
  updateFaq,
  deleteFaq,
  broadcastEmail,
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
router.post("/broadcast-email", broadcastEmail);
router.post("/send-email", sendCustomEmail);

// User Inquiries Management
router.get("/inquiries", getInquiries);
router.put("/inquiries/:id", updateInquiryStatus);
router.delete("/inquiries/:id", deleteInquiry);

// FAQ Management
router.get("/faqs", getAllFaqsAdmin);
router.post("/faqs", createFaq);
router.put("/faqs/:id", updateFaq);
router.delete("/faqs/:id", deleteFaq);

module.exports = router;
