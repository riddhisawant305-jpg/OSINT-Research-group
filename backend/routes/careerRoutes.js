const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  getCareerMentorAdvice,
  analyzeResume,
  optimizeProfileFromResume,
  generateJobInterview,
  evaluateJobInterview,
  matchResumeWithJob,
  generatePracticeInterview,
  evaluatePracticeInterviewAction,
} = require("../controllers/careerController");
const { protect } = require("../middleware/authMiddleware");

const resumesUploadDir = path.join(__dirname, "../uploads/resumes");
if (!fs.existsSync(resumesUploadDir)) {
  fs.mkdirSync(resumesUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resumesUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".pdf";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "resume-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Optional protect helper so tools function smoothly both when logged in or testing
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    return protect(req, res, next);
  }
  next();
};

// Task 1: Resume Profile Optimizer
router.post(
  "/optimize-profile-from-resume",
  optionalProtect,
  upload.single("resume"),
  optimizeProfileFromResume
);

// Task 2: Job-Specific AI Mock Interview
router.post("/job-mock-interview/generate", optionalProtect, generateJobInterview);
router.post("/job-mock-interview/evaluate", optionalProtect, evaluateJobInterview);

// Task 3: Match Saved Resume with Job
router.post(
  "/match-resume-job",
  optionalProtect,
  upload.single("resume"),
  matchResumeWithJob
);

// Task 4: AI Resume Analyzer (ATS)
router.post("/resume-analyzer", optionalProtect, upload.single("resume"), analyzeResume);

// Task 5: Practice Interview (Home Screen Career Tool - Rated out of 10)
router.post("/practice-interview/generate", optionalProtect, generatePracticeInterview);
router.post("/practice-interview/evaluate", optionalProtect, evaluatePracticeInterviewAction);

// Task 6: AI Career Mentor (Domain-Guarded Chatbot)
router.post("/mentor", optionalProtect, getCareerMentorAdvice);

module.exports = router;
