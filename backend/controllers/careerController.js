const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Job = require("../models/Job");
const User = require("../models/User");
const {
  extractTextFromPdfBuffer,
  isResumeDocument,
  optimizeProfileFromResumeContent,
  generateJobMockInterviewQuestions,
  evaluateJobMockInterview,
  matchSavedResumeWithJob,
  analyzeResumeATS,
  generatePracticeInterviewQuestions,
  evaluatePracticeInterview,
  generateCareerMentorResponse,
} = require("../services/agenticCareerModel");

// Helper: resolve job document by ObjectId or numericId
const resolveJob = async (jobIdOrData) => {
  if (!jobIdOrData) return null;
  if (typeof jobIdOrData === "object" && jobIdOrData.title) return jobIdOrData;

  const idStr = String(jobIdOrData);
  if (mongoose.Types.ObjectId.isValid(idStr)) {
    const job = await Job.findById(idStr).populate("recruiter", "name email companyName");
    if (job) return job;
  }

  const numeric = Number(idStr);
  if (!isNaN(numeric)) {
    const job = await Job.findOne({ numericId: numeric }).populate("recruiter", "name email companyName");
    if (job) return job;
  }

  return null;
};

// Helper: resolve candidate's resume text from disk or DB
const resolveCandidateResumeText = async (user) => {
  if (!user) return "";

  // If user has an uploaded resume file on disk
  if (user.resume && typeof user.resume === "string") {
    if (user.resume.startsWith("/uploads/resumes/")) {
      const diskPath = path.join(__dirname, "..", user.resume.replace(/^\//, ""));
      if (fs.existsSync(diskPath)) {
        try {
          const text = await extractTextFromPdfBuffer(diskPath);
          if (text && text.trim()) return text.trim();
        } catch (e) {
          console.warn("[CareerController] Failed to read saved resume file:", e.message);
        }
      }
    } else if (user.resume.startsWith("data:") && user.resume.includes("base64,")) {
      try {
        const text = await extractTextFromPdfBuffer(user.resume);
        if (text && text.trim()) return text.trim();
      } catch (e) {
        console.warn("[CareerController] Failed to parse base64 resume:", e.message);
      }
    }
  }

  // Fallback to structured profile details string
  const profileSummary = [
    `Name: ${user.name || ""}`,
    `Headline: ${user.headline || ""}`,
    `Skills: ${Array.isArray(user.skills) ? user.skills.join(", ") : ""}`,
    `Education: ${user.education || ""}`,
    `About: ${user.about || ""}`,
    `Experience: ${Array.isArray(user.experience) ? user.experience.map(e => `${e.role} at ${e.company}: ${e.description || ""}`).join(" | ") : ""}`,
    `Projects: ${Array.isArray(user.projects) ? user.projects.map(p => `${p.title}: ${p.description || ""} (${(p.technologies || []).join(", ")})`).join(" | ") : ""}`
  ].join("\n");

  return profileSummary;
};

// ============================================================================
// TASK 1: RESUME PROFILE OPTIMIZER AGENT
// @route   POST /api/career/optimize-profile-from-resume
// ============================================================================
const optimizeProfileFromResume = async (req, res, next) => {
  try {
    let fileBuffer = null;
    let mimeType = null;
    let textContent = "";

    if (req.file) {
      if (req.file.buffer) {
        fileBuffer = req.file.buffer;
      } else if (req.file.path) {
        fileBuffer = fs.readFileSync(req.file.path);
      }
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

    // Extract text for prior resume check
    let rawText = textContent || "";
    if (!rawText && fileBuffer) {
      rawText = await extractTextFromPdfBuffer(fileBuffer);
    }

    // Pre-check if valid resume document
    const check = isResumeDocument(rawText);
    if (!check.isValid) {
      return res.status(400).json({
        success: false,
        message: check.reason || "Uploaded document does not appear to be a resume or CV. Please upload a professional resume containing your education, skills, and work experience.",
      });
    }

    let resumePath = "";
    let resumeFileName = "";
    let resumeFileType = "";

    if (req.file) {
      resumeFileType = mimeType || "application/pdf";
      resumePath = `/uploads/resumes/${req.file.filename}`;
      resumeFileName = req.file?.originalname || "Resume.pdf";
    } else if (fileBuffer) {
      resumeFileType = mimeType || "application/pdf";
      resumePath = `data:${resumeFileType};base64,${fileBuffer.toString("base64")}`;
      resumeFileName = "Resume.pdf";
    } else if (textContent) {
      resumeFileType = "text/plain";
      resumePath = `data:text/plain;base64,${Buffer.from(textContent).toString("base64")}`;
      resumeFileName = "Pasted_Resume.txt";
    }

    // Extraction: Prefer Gemini API when GEMINI_API_KEY is configured, fallback to Agentic model
    let extractedProfile = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        const { extractProfileFromResume: geminiExtractProfile } = require("../services/geminiService");
        extractedProfile = await geminiExtractProfile(fileBuffer, mimeType, rawText);
      } catch (geminiErr) {
        console.warn("[OptimizeProfile] Gemini API extraction fallback:", geminiErr.message);
      }
    }

    if (!extractedProfile) {
      extractedProfile = await optimizeProfileFromResumeContent(fileBuffer, mimeType, rawText);
    }

    extractedProfile.resume = resumePath;
    extractedProfile.resumeFileName = resumeFileName;
    extractedProfile.resumeFileType = resumeFileType;

    // Immediately persist resume file if authenticated
    if (req.user && resumePath) {
      req.user.resume = resumePath;
      req.user.resumeFileName = resumeFileName;
      req.user.resumeFileType = resumeFileType;
      req.user.resumeUpdatedAt = new Date();
      await req.user.save();
    }

    // Auto-apply to profile if requested or if autoApply flag is true
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
        if (Array.isArray(extractedProfile.hobbies) && extractedProfile.hobbies.length > 0) {
          user.hobbies = Array.from(new Set([...(user.hobbies || []), ...extractedProfile.hobbies]));
        }
        if (Array.isArray(extractedProfile.experience) && extractedProfile.experience.length > 0) {
          user.experience = extractedProfile.experience;
        }
        if (Array.isArray(extractedProfile.projects) && extractedProfile.projects.length > 0) {
          user.projects = extractedProfile.projects;
        }
        if (resumePath) {
          user.resume = resumePath;
          user.resumeFileName = resumeFileName;
          user.resumeFileType = resumeFileType;
          user.resumeUpdatedAt = new Date();
        }
        await user.save();

        return res.status(200).json({
          success: true,
          message: "Profile updated and optimized successfully by CareerVerse Agentic AI",
          data: user,
          extracted: extractedProfile,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Resume parsed and profile structured successfully by CareerVerse Agentic AI",
      data: extractedProfile,
    });
  } catch (error) {
    console.error("Resume Optimization Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Resume parsing failed: " + error.message,
    });
  }
};

// ============================================================================
// TASK 2: CAREER TOOLS AI MOCK INTERVIEW (Job-Specific)
// @route   POST /api/career/job-mock-interview/generate
// @route   POST /api/career/job-mock-interview/evaluate
// ============================================================================
const generateJobInterview = async (req, res, next) => {
  try {
    const { jobId, job: jobData, organization } = req.body;
    const targetJob = (await resolveJob(jobId)) || jobData;

    if (!targetJob) {
      return res.status(400).json({
        success: false,
        message: "Target job details are required for job mock interview.",
      });
    }

    // Candidate resume text or profile
    let candidateResume = await resolveCandidateResumeText(req.user);

    const interview = await generateJobMockInterviewQuestions(
      targetJob,
      organization || targetJob.organizationDetails,
      candidateResume || req.user
    );

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("Job Mock Interview Generation Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate AI mock interview: " + error.message,
    });
  }
};

const evaluateJobInterview = async (req, res, next) => {
  try {
    const { jobId, job: jobData, organization, answers } = req.body;
    const targetJob = (await resolveJob(jobId)) || jobData || { title: "Software Engineer", company: "Company" };

    let candidateResume = await resolveCandidateResumeText(req.user);

    const report = await evaluateJobMockInterview(
      targetJob,
      organization || targetJob.organizationDetails,
      candidateResume || req.user,
      answers || {}
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Job Mock Interview Evaluation Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to evaluate AI mock interview: " + error.message,
    });
  }
};

// ============================================================================
// TASK 3: "MATCH YOUR SAVED RESUME" ALIGNMENT
// @route   POST /api/career/match-resume-job
// ============================================================================
const matchResumeWithJob = async (req, res, next) => {
  try {
    const { jobId, job: jobData, organization } = req.body;
    const targetJob = (await resolveJob(jobId)) || jobData;

    if (!targetJob) {
      return res.status(400).json({
        success: false,
        message: "Job details are required to evaluate resume alignment.",
      });
    }

    let resumeText = "";
    if (req.file) {
      const buffer = req.file.buffer || (req.file.path ? fs.readFileSync(req.file.path) : null);
      resumeText = await extractTextFromPdfBuffer(buffer);
    } else if (req.body && (req.body.text || req.body.resumeText)) {
      resumeText = req.body.text || req.body.resumeText;
    } else {
      resumeText = await resolveCandidateResumeText(req.user);
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: "No saved resume or profile details found. Please upload or save your resume first.",
      });
    }

    const matchAnalysis = await matchSavedResumeWithJob(
      targetJob,
      organization || targetJob.organizationDetails,
      resumeText
    );

    res.status(200).json({
      success: true,
      data: matchAnalysis,
    });
  } catch (error) {
    console.error("Resume Match Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to match resume with job: " + error.message,
    });
  }
};

// ============================================================================
// TASK 4: CAREER TOOLS AI RESUME ANALYZER (ATS Evaluator)
// @route   POST /api/career/resume-analyzer
// ============================================================================
const analyzeResume = async (req, res, next) => {
  try {
    let fileBufferOrPath = null;
    let directText = "";

    if (req.file) {
      fileBufferOrPath = req.file.path || req.file.buffer;
    } else if (req.body.useSavedResume && req.user && req.user.resume) {
      if (req.user.resume.startsWith("/uploads/resumes/")) {
        fileBufferOrPath = path.join(__dirname, "..", req.user.resume.replace(/^\//, ""));
      } else {
        fileBufferOrPath = req.user.resume;
      }
    } else if (req.body && req.body.text) {
      directText = req.body.text;
    } else if (req.user) {
      directText = await resolveCandidateResumeText(req.user);
    }

    const analysis = await analyzeResumeATS(fileBufferOrPath, directText);

    res.status(200).json({
      success: true,
      message: "Resume analyzed successfully by CareerVerse ATS Agent",
      data: analysis,
    });
  } catch (error) {
    console.error("Resume Analysis Error:", error.message);
    const isValidationError = error.message && (
      error.message.includes("does not appear to be a resume") ||
      error.message.includes("too few words") ||
      error.message.includes("No readable resume text") ||
      error.message.includes("appears to be")
    );
    res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Resume analysis failed: " + error.message,
    });
  }
};

// ============================================================================
// TASK 5: PRACTICE INTERVIEWS (Home Screen Career Tools - Rated out of 10)
// @route   POST /api/career/practice-interview/generate
// @route   POST /api/career/practice-interview/evaluate
// ============================================================================
const generatePracticeInterview = async (req, res, next) => {
  try {
    let candidateResumeOrProfile = req.user;
    if (req.user) {
      const resumeText = await resolveCandidateResumeText(req.user);
      candidateResumeOrProfile = {
        name: req.user.name,
        headline: req.user.headline,
        skills: req.user.skills,
        experience: req.user.experience,
        resumeText
      };
    }

    const interview = await generatePracticeInterviewQuestions(candidateResumeOrProfile);

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("Practice Interview Generation Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate practice interview: " + error.message,
    });
  }
};

const evaluatePracticeInterviewAction = async (req, res, next) => {
  try {
    const { answers } = req.body;
    let candidateResumeOrProfile = req.user;

    const report = await evaluatePracticeInterview(candidateResumeOrProfile, answers || {});

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Practice Interview Evaluation Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to evaluate practice interview: " + error.message,
    });
  }
};

// ============================================================================
// TASK 6: CAREER TOOLS AI CAREER MENTOR (Domain-Guarded Chatbot)
// @route   POST /api/career/mentor
// ============================================================================
const getCareerMentorAdvice = async (req, res, next) => {
  try {
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const profileContext = {
      name: req.user ? req.user.name : "User",
      headline: req.user ? req.user.headline : "",
      skills: req.user ? req.user.skills : [],
      education: req.user ? req.user.education : "",
      experience: req.user ? req.user.experience : [],
      ...(context || {}),
    };

    const reply = await generateCareerMentorResponse(message.trim(), profileContext);

    res.status(200).json({
      success: true,
      message: "Advice generated successfully",
      data: {
        reply,
      },
    });
  } catch (error) {
    console.error("Career Mentor Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Career Mentor is temporarily unavailable: " + error.message,
    });
  }
};

module.exports = {
  optimizeProfileFromResume,
  generateJobInterview,
  evaluateJobInterview,
  matchResumeWithJob,
  analyzeResume,
  generatePracticeInterview,
  evaluatePracticeInterviewAction,
  getCareerMentorAdvice,
};
