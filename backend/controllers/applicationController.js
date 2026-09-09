const Application = require("../models/Application");
const Job = require("../models/Job");
const mongoose = require("mongoose");

// Helper to find job by either ObjectId or numericId
const findJobByAnyId = async (idParam) => {
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    const job = await Job.findById(idParam);
    if (job) return job;
  }
  const numeric = Number(idParam);
  if (!isNaN(numeric)) {
    return Job.findOne({ numericId: numeric });
  }
  return null;
};

// @desc    Apply to a job
// @route   POST /api/jobs/:jobId/apply
// @access  Private (Student)
const applyForJob = async (req, res, next) => {
  try {
    const job = await findJobByAnyId(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const applicantId = req.user._id;

    // Check if already applied
    const existing = await Application.findOne({
      applicant: applicantId,
      job: job._id,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
        data: existing,
      });
    }

    const { resume, resumeFileName, resumeFileType, coverLetter } = req.body;

    const application = await Application.create({
      applicant: applicantId,
      job: job._id,
      resume: resume || req.user.resume || "",
      resumeFileName:
        resumeFileName ||
        req.user.resumeFileName ||
        (req.user.resume ? "Applicant_Resume.pdf" : ""),
      resumeFileType:
        resumeFileType ||
        req.user.resumeFileType ||
        "application/pdf",
      coverLetter: coverLetter || "",
      status: "Applied",
    });

    // Increment applicantsCount on Job
    job.applicantsCount = (job.applicantsCount || 0) + 1;
    await job.save();

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }
    next(error);
  }
};

// @desc    Get all applications for current logged in student
// @route   GET /api/applications/me
// @access  Private
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate("job")
      .sort("-createdAt");

    const formatted = applications
      .filter((app) => app.job != null)
      .map((app) => ({
        _id: app._id,
        id: app._id,
        jobId: app.job.numericId || app.job._id,
        job: {
          _id: app.job._id,
          id: app.job.numericId || app.job._id,
          title: app.job.title,
          company: app.job.company,
          location: app.job.location,
          salary: app.job.salary,
          type: app.job.type,
          logo: app.job.logo,
          logoColor: app.job.logoColor,
        },
        status: app.status,
        createdAt: app.createdAt,
      }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for a specific job (Recruiter only)
// @route   GET /api/jobs/:jobId/applications
// @access  Private (Recruiter)
const getJobApplications = async (req, res, next) => {
  try {
    const job = await findJobByAnyId(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Recruiter authorization check: must own this job or be an admin
    if (job.recruiter && job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view applications for jobs you posted",
      });
    }

    const applications = await Application.find({ job: job._id })
      .populate("applicant", "name email headline skills education experience resume resumeFileName resumeFileType avatarColor initials")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid application ID" });
    }

    const application = await Application.findById(req.params.id)
      .populate("job")
      .populate("applicant", "name email headline skills education");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const uId = req.user._id.toString();
    const isApplicant = application.applicant._id.toString() === uId;
    const isJobRecruiter =
      application.job &&
      application.job.recruiter &&
      application.job.recruiter.toString() === uId;

    if (!isApplicant && !isJobRecruiter) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this application",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter only)
const updateApplicationStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid application ID" });
    }

    const { status } = req.body;
    const validStatuses = ["Applied", "Under Review", "Shortlisted", "Rejected", "Accepted"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const application = await Application.findById(req.params.id).populate("job");
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Only the recruiter who posted the job can update status
    if (
      application.job.recruiter &&
      application.job.recruiter.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update applications for your own job postings",
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
};
