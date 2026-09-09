const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getCareerMentorAdvice,
  analyzeResume,
  optimizeProfileFromResume,
} = require("../controllers/careerController");
const { protect } = require("../middleware/authMiddleware");

// Memory storage for small file parsing without saving to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Optional protect helper so testing tools works even if called before login or authenticated
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    return protect(req, res, next);
  }
  next();
};

router.post("/mentor", optionalProtect, getCareerMentorAdvice);
router.post("/resume-analyzer", optionalProtect, upload.single("resume"), analyzeResume);
router.post(
  "/optimize-profile-from-resume",
  optionalProtect,
  upload.single("resume"),
  optimizeProfileFromResume
);

module.exports = router;
