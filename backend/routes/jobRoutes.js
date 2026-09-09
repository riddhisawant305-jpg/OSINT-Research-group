const express = require("express");
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  saveJob,
  removeSavedJob,
  getMySavedJobs,
  getMyPostedJobs,
} = require("../controllers/jobController");
const {
  applyForJob,
  getJobApplications,
} = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Job listing & details
router.get("/", getJobs);
router.get("/my-jobs", protect, authorize("recruiter", "organization"), getMyPostedJobs);
router.get("/:id", getJobById);

// Recruiter actions
router.post("/", protect, authorize("recruiter"), createJob);
router.put("/:id", protect, authorize("recruiter"), updateJob);
router.delete("/:id", protect, authorize("recruiter"), deleteJob);

// Saved jobs
router.post("/:jobId/save", protect, saveJob);
router.delete("/:jobId/save", protect, removeSavedJob);

// Applications for job
router.post("/:jobId/apply", protect, applyForJob);
router.get("/:jobId/applications", protect, authorize("recruiter"), getJobApplications);

module.exports = router;
