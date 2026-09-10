const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

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
  uploadAvatar,
  getHiredEmployees,
  createHiredEmployee,
  updateHiredEmployee,
  deleteHiredEmployee,
} = require("../controllers/userController");
const { getMySavedJobs } = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

// Ensure avatar uploads directory exists
const avatarDir = path.join(__dirname, "../uploads/avatars");
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + ext);
  },
});

const avatarUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for avatars"));
    }
  },
});

// Private current user routes
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.post("/me/avatar", protect, avatarUpload.single("avatar"), uploadAvatar);
router.get("/me/dashboard", protect, getDashboard);
router.get("/me/saved-jobs", protect, getMySavedJobs);

// Hired Employees (Organization / Recruiter)
router.get("/me/hired-employees", protect, getHiredEmployees);
router.post("/me/hired-employees", protect, createHiredEmployee);
router.put("/me/hired-employees/:id", protect, updateHiredEmployee);
router.delete("/me/hired-employees/:id", protect, deleteHiredEmployee);

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
