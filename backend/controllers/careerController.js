const {
  generateCareerAdvice,
  analyzeResumeContent,
  extractProfileFromResume,
} = require("../services/geminiService");

// @desc    Get advice from AI Career Mentor
// @route   POST /api/career/mentor
// @access  Private
const getCareerMentorAdvice = async (req, res, next) => {
  try {
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Build context from authenticated user's DB profile or provided context
    const profileContext = {
      name: req.user ? req.user.name : "User",
      headline: req.user ? req.user.headline : "",
      skills: req.user ? req.user.skills : [],
      education: req.user ? req.user.education : "",
      experience: req.user ? req.user.experience : [],
      ...(context || {}),
    };

    const reply = await generateCareerAdvice(message.trim(), profileContext);

    res.status(200).json({
      success: true,
      message: "Advice generated successfully",
      data: {
        reply,
      },
    });
  } catch (error) {
    console.error("Gemini Mentor Error:", error.message);

    // Return a friendly error message without leaking keys or credentials
    if (error.message.includes("Gemini API key is not configured")) {
      return res.status(503).json({
        success: false,
        message: "Gemini AI is not configured yet. Please provide a GEMINI_API_KEY in backend/.env.",
      });
    }

    if (error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("429")) {
      return res.status(429).json({
        success: false,
        message: "Gemini API rate limit reached. Please wait a moment and try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "AI service is temporarily unavailable. " + error.message,
    });
  }
};

// @desc    Analyze resume using Gemini ATS Evaluator
// @route   POST /api/career/resume-analyzer
// @access  Private
const analyzeResume = async (req, res, next) => {
  try {
    let resumeText = "";

    // If file uploaded via multer
    if (req.file) {
      if (req.file.buffer) {
        resumeText = req.file.buffer.toString("utf8");
      }
    }

    // If text passed in body
    if (!resumeText && req.body && req.body.text) {
      resumeText = req.body.text;
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide resume content or upload a resume file",
      });
    }

    const analysis = await analyzeResumeContent(resumeText.trim());

    res.status(200).json({
      success: true,
      message: "Resume analyzed successfully",
      data: analysis,
    });
  } catch (error) {
    console.error("Gemini Resume Analysis Error:", error.message);

    if (error.message.includes("Gemini API key is not configured")) {
      return res.status(503).json({
        success: false,
        message: "Gemini AI is not configured yet. Please provide a GEMINI_API_KEY in backend/.env.",
      });
    }

    if (error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("429")) {
      return res.status(429).json({
        success: false,
        message: "Gemini API rate limit reached. Please wait a moment and try again.",
      });
    }

    if (error.message.includes("503") || error.message.includes("Service Unavailable") || error.message.includes("high demand")) {
      return res.status(503).json({
        success: false,
        message: "Google Gemini is temporarily experiencing high demand. Please try again in a few moments.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Resume analysis failed: " + error.message,
    });
  }
};

// @desc    Parse and optimize profile from uploaded resume using Gemini
// @route   POST /api/career/optimize-profile-from-resume
// @access  Private / Public
const optimizeProfileFromResume = async (req, res, next) => {
  try {
    let fileBuffer = null;
    let mimeType = null;
    let textContent = "";

    if (req.file) {
      fileBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    }

    if (req.body) {
      textContent = req.body.text || req.body.resumeText || "";
    }

    if (!fileBuffer && (!textContent || !textContent.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume file (PDF, TXT) or paste resume text",
      });
    }

    let resumeDataUri = "";
    let resumeFileName = "";
    let resumeFileType = "";

    if (fileBuffer) {
      resumeFileType = mimeType || "application/pdf";
      resumeDataUri = `data:${resumeFileType};base64,${fileBuffer.toString("base64")}`;
      resumeFileName = req.file?.originalname || "Resume.pdf";
    } else if (textContent) {
      resumeFileType = "text/plain";
      resumeDataUri = `data:text/plain;base64,${Buffer.from(textContent).toString("base64")}`;
      resumeFileName = "Pasted_Resume.txt";
    }

    const extractedProfile = await extractProfileFromResume(fileBuffer, mimeType, textContent);
    extractedProfile.resume = resumeDataUri;
    extractedProfile.resumeFileName = resumeFileName;
    extractedProfile.resumeFileType = resumeFileType;

    // If autoApply flag is passed and user is authenticated, automatically update user's profile
    if (req.body.autoApply === "true" || req.body.autoApply === true) {
      if (req.user) {
        const user = req.user;
        if (extractedProfile.headline) user.headline = extractedProfile.headline;
        if (extractedProfile.about) user.about = extractedProfile.about;
        if (extractedProfile.location) user.location = extractedProfile.location;
        if (extractedProfile.phone) user.phone = extractedProfile.phone;
        if (extractedProfile.education) user.education = extractedProfile.education;
        if (Array.isArray(extractedProfile.skills) && extractedProfile.skills.length > 0) {
          user.skills = Array.from(new Set([...user.skills, ...extractedProfile.skills]));
        }
        if (Array.isArray(extractedProfile.experience) && extractedProfile.experience.length > 0) {
          user.experience = extractedProfile.experience;
        }
        if (Array.isArray(extractedProfile.projects) && extractedProfile.projects.length > 0) {
          user.projects = extractedProfile.projects;
        }
        if (resumeDataUri) {
          user.resume = resumeDataUri;
          user.resumeFileName = resumeFileName;
          user.resumeFileType = resumeFileType;
          user.resumeUpdatedAt = new Date();
        }
        await user.save();

        return res.status(200).json({
          success: true,
          message: "Profile updated and optimized successfully from resume",
          data: user,
          extracted: extractedProfile,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Resume analyzed and profile structured successfully",
      data: extractedProfile,
    });
  } catch (error) {
    console.error("Gemini Profile Optimization Error:", error.message);

    if (error.message.includes("Gemini API key is not configured")) {
      return res.status(503).json({
        success: false,
        message: "Gemini AI is not configured yet. Please provide a GEMINI_API_KEY in backend/.env.",
      });
    }

    if (error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("429")) {
      return res.status(429).json({
        success: false,
        message: "Gemini API rate limit reached. Please wait a moment and try again.",
      });
    }

    if (error.message.includes("503") || error.message.includes("Service Unavailable") || error.message.includes("high demand")) {
      return res.status(503).json({
        success: false,
        message: "Google Gemini is temporarily experiencing high demand. Please try again in a few moments.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Resume parsing failed: " + error.message,
    });
  }
};

module.exports = {
  getCareerMentorAdvice,
  analyzeResume,
  optimizeProfileFromResume,
};
