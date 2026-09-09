const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  getUserById,
  updateMyProfile,
  addSkill,
  updateSkills,
  removeSkill,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  addProject,
  updateProject,
  deleteProject,
  getDashboard,
} = require("../controllers/userController");
const { getMySavedJobs } = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

// Private current user routes
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.get("/me/dashboard", protect, getDashboard);
router.get("/me/saved-jobs", protect, getMySavedJobs);

// Skills
router.post("/me/skills", protect, addSkill);
router.put("/me/skills", protect, updateSkills);
router.delete("/me/skills/:skill", protect, removeSkill);

// Education
router.post("/me/education", protect, addEducation);
router.put("/me/education/:educationId", protect, updateEducation);
router.delete("/me/education/:educationId", protect, deleteEducation);

// Experience
router.post("/me/experience", protect, addExperience);
router.put("/me/experience/:experienceId", protect, updateExperience);
router.delete("/me/experience/:experienceId", protect, deleteExperience);

// Projects
router.post("/me/projects", protect, addProject);
router.put("/me/projects/:projectId", protect, updateProject);
router.delete("/me/projects/:projectId", protect, deleteProject);

// Public user profile by ID
router.get("/:id", getUserById);

module.exports = router;
