const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const mongoose = require("mongoose");
const { createNotification } = require("./notificationController");
const {
  sendJobApplicationSubmittedEmail,
  sendJobApplicationReceivedOrgEmail,
  sendJobApplicationStatusUpdateEmail,
  sendCandidateHiredOrgEmail,
} = require("../services/emailService");

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

    // Populate recruiter details to obtain organization email
    await job.populate("recruiter", "name email companyName");

    // 1. Asynchronously send confirmation email to the applicant
    if (req.user.email) {
      sendJobApplicationSubmittedEmail({
        to: req.user.email,
        applicantName: req.user.name,
        jobTitle: job.title,
        companyName: job.company,
        location: job.location,
        salary: job.salary,
        type: job.type,
      }).catch((err) => console.warn("[Application] Applicant confirmation email error:", err.message));
    }

    // 2. Asynchronously notify organization with applicant details and resume attachment
    const recruiterEmail = job.recruiter?.email || job.hrDetails?.email;
    if (recruiterEmail) {
      sendJobApplicationReceivedOrgEmail({
        to: recruiterEmail,
        companyName: job.company,
        jobTitle: job.title,
        applicantName: req.user.name,
        applicantEmail: req.user.email,
        applicantHeadline: req.user.headline,
        applicantPhone: req.user.phone,
        coverLetter,
        resumePath: application.resume,
        resumeFileName: application.resumeFileName,
      }).catch((err) => console.warn("[Application] Recruiter notification email error:", err.message));
    }

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

    // Auto-add candidate to 'Hired from CareerVerse' when status is Accepted
    if (status === "Accepted") {
      try {
        const HiredEmployee = require("../models/HiredEmployee");
        const User = require("../models/User");

        let existingHired = await HiredEmployee.findOne({
          organization: req.user._id,
          application: application._id,
        });

        if (!existingHired) {
          const applicantUser = await User.findById(application.applicant);
          const autoEmpId = `CV-EMP-${Math.floor(1000 + Math.random() * 9000)}`;

          await HiredEmployee.create({
            organization: req.user._id,
            candidate: application.applicant,
            application: application._id,
            jobId: application.job?._id ? application.job._id.toString() : "",
            candidateName: application.name || applicantUser?.name || "Candidate",
            candidateEmail: application.email || applicantUser?.email || "",
            employeeId: autoEmpId,
            role: application.job?.title || "Software Engineer",
            salary: application.job?.salary || "Competitive",
            hiredDate: new Date(),
            joiningDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            resume: application.resume || applicantUser?.resume || "",
            resumeFileName: application.resumeFileName || applicantUser?.resumeFileName || "Candidate_Resume.pdf",
            notes: `Accepted through CareerVerse on ${new Date().toLocaleDateString()} for ${application.job?.title || "Role"}.`,
            status: "Active",
          });
        }
      } catch (hiredErr) {
        console.error("Failed to auto-create HiredEmployee:", hiredErr.message);
      }
    }

    // Notify the candidate in the Jobs section
    const orgName = req.user.companyName || req.user.name || "The employer";
    const jobTitle = application.job?.title || "Job Position";
    await createNotification({
      recipient: application.applicant,
      sender: req.user._id,
      type: "job",
      title: `Application Update: ${jobTitle}`,
      text: `Your application for "${jobTitle}" was updated to "${status}" by ${orgName}.`,
      link: "/dashboard",
    });

    // Asynchronously send status update email to applicant
    let applicantUserForEmail = null;
    try {
      applicantUserForEmail = await User.findById(application.applicant).select("name email");
      if (applicantUserForEmail && applicantUserForEmail.email) {
        sendJobApplicationStatusUpdateEmail({
          to: applicantUserForEmail.email,
          applicantName: applicantUserForEmail.name,
          jobTitle,
          companyName: orgName,
          newStatus: status,
        }).catch((err) => console.warn("[Application] Status update email error:", err.message));
      }
    } catch (appErr) {
      console.warn("[Application] Applicant lookup error for status email:", appErr.message);
    }

    // If accepted/hired, also send confirmation email to organization
    if (status === "Accepted" && req.user.email) {
      sendCandidateHiredOrgEmail({
        to: req.user.email,
        companyName: orgName,
        candidateName: applicantUserForEmail?.name || "Candidate",
        candidateEmail: applicantUserForEmail?.email || "",
        jobTitle,
        salary: application.job?.salary || "Competitive",
      }).catch((err) => console.warn("[Application] Hired confirmation email error:", err.message));
    }

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
