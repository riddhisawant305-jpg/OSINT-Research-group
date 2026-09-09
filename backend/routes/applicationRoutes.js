const express = require("express");
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Current user applications
router.get("/me", protect, getMyApplications);
router.get("/:id", protect, getApplicationById);

// Recruiter updates status
router.put("/:id/status", protect, authorize("recruiter"), updateApplicationStatus);

module.exports = router;
