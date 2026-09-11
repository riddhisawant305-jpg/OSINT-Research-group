const Job = require("../models/Job");
const SavedJob = require("../models/SavedJob");
const User = require("../models/User");
const Connection = require("../models/Connection");
const mongoose = require("mongoose");
const {
  sendJobListedOrgEmail,
  sendConnectionNewJobEmail,
} = require("../services/emailService");

// Helper to find job by either ObjectId or numericId
const findJobByAnyId = async (idParam) => {
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    const job = await Job.findById(idParam).populate("recruiter", "name email companyName isVerified");
    if (job) return job;
  }
  const numeric = Number(idParam);
  if (!isNaN(numeric)) {
    return Job.findOne({ numericId: numeric }).populate("recruiter", "name email companyName isVerified");
  }
  return null;
};

// @desc    Get all jobs with search and filter
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const { search, type, location } = req.query;
    let query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ title: regex }, { company: regex }, { location: regex }, { skills: regex }];
    }

    if (type && type !== "All") {
      query.type = type;
    }

    if (location && location.trim()) {
      query.location = new RegExp(location.trim(), "i");
    }

    const jobs = await Job.find(query)
      .populate("recruiter", "name email companyName isVerified")
      .sort({ createdAt: -1 });

    const formatted = jobs.map((j) => ({
      _id: j._id,
      id: j.numericId || j._id,
      numericId: j.numericId,
      title: j.title,
      company: j.company,
      logo: j.logo || j.company.slice(0, 2).toUpperCase(),
      logoColor: j.logoColor || "#2563eb",
      location: j.location,
      type: j.type,
      workplaceType: j.workplaceType || "On-site",
      experienceLevel: j.experienceLevel || "Mid-Level",
      salary: j.salary,
      posted: j.posted,
      description: j.description,
      aboutRole: j.aboutRole || "",
      responsibilities: j.responsibilities || [],
      requirements: j.requirements || [],
      hrDetails: j.hrDetails || null,
      organizationDetails: j.organizationDetails || null,
      skills: j.skills,
      applicants: j.applicantsCount || 0,
      recruiter: j.recruiter,
      isVerified: !!(j.recruiter?.isVerified),
      createdAt: j.createdAt,
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

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await findJobByAnyId(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const formatted = {
      _id: job._id,
      id: job.numericId || job._id,
      numericId: job.numericId,
      title: job.title,
      company: job.company,
      logo: job.logo || job.company.slice(0, 2).toUpperCase(),
      logoColor: job.logoColor || "#2563eb",
      location: job.location,
      type: job.type,
      workplaceType: job.workplaceType || "On-site",
      experienceLevel: job.experienceLevel || "Mid-Level",
      salary: job.salary,
      posted: job.posted,
      description: job.description,
      aboutRole: job.aboutRole || "",
      responsibilities: job.responsibilities || [],
      requirements: job.requirements || [],
      hrDetails: job.hrDetails || null,
      organizationDetails: job.organizationDetails || null,
      skills: job.skills,
      applicants: job.applicantsCount || 0,
      recruiter: job.recruiter,
      isVerified: !!(job.recruiter?.isVerified),
      createdAt: job.createdAt,
    };

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs posted by current recruiter/organization
// @route   GET /api/jobs/my-jobs
// @access  Private (Recruiter / Organization)
const getMyPostedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort("-createdAt");
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Recruiter / Organization)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      type,
      workplaceType,
      experienceLevel,
      salary,
      description,
      aboutRole,
      responsibilities,
      requirements,
      skills,
      hrDetails,
      organizationDetails,
      logo,
      logoColor,
    } = req.body;

    const companyName =
      (company && company.trim()) ||
      req.user.companyName ||
      req.user.name ||
      "Organization";

    if (!title || !location || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, location, and description are required",
      });
    }

    const job = await Job.create({
      title: title.trim(),
      company: companyName,
      location: location.trim(),
      type: type || "Full-time",
      workplaceType: workplaceType || "On-site",
      experienceLevel: experienceLevel || "Mid-Level",
      salary: salary ? salary.trim() : "Competitive",
      description: description.trim(),
      aboutRole: aboutRole ? aboutRole.trim() : "",
      responsibilities: Array.isArray(responsibilities)
        ? responsibilities.map((r) => String(r).trim()).filter(Boolean)
        : typeof responsibilities === "string"
        ? responsibilities.split("\n").map((r) => r.trim()).filter(Boolean)
        : [],
      requirements: Array.isArray(requirements)
        ? requirements.map((r) => String(r).trim()).filter(Boolean)
        : typeof requirements === "string"
        ? requirements.split("\n").map((r) => r.trim()).filter(Boolean)
        : [],
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      hrDetails: hrDetails || req.user.hrDetails || {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || "",
      },
      organizationDetails: organizationDetails || req.user.organizationDetails || {
        name: companyName,
        website: req.user.companyWebsite || "",
        about: req.user.about || "",
        industry: req.user.companyIndustry || "",
      },
      logo: logo || "",
      logoColor: logoColor || req.user.avatarColor || "#2563eb",
      recruiter: req.user._id,
    });

    // 1. Asynchronously send confirmation email to the organization
    if (req.user.email) {
      sendJobListedOrgEmail({
        to: req.user.email,
        companyName: job.company,
        jobTitle: job.title,
        location: job.location,
        salary: job.salary,
        type: job.type,
        description: job.description,
      }).catch((err) => console.warn("[Job] Error sending job listed email to org:", err.message));
    }

    // 2. Asynchronously notify author's candidate connections via email
    try {
      const connections = await Connection.find({
        $or: [{ requester: req.user._id }, { recipient: req.user._id }],
        status: "accepted",
      });

      const connectionUserIds = connections.map((c) =>
        c.requester.toString() === req.user._id.toString() ? c.recipient : c.requester
      );

      if (connectionUserIds.length > 0) {
        const connectedUsers = await User.find({
          _id: { $in: connectionUserIds },
        }).select("name email");

        connectedUsers.forEach((u) => {
          sendConnectionNewJobEmail({
            to: u.email,
            recipientName: u.name,
            companyName: job.company,
            jobTitle: job.title,
            location: job.location,
            salary: job.salary,
            type: job.type,
            jobDescription: job.description,
          }).catch((err) => console.warn("[Job] Error sending new job alert email:", err.message));
        });
      }
    } catch (connErr) {
      console.warn("[Job] Connection job alert error:", connErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only)
const updateJob = async (req, res, next) => {
  try {
    const job = await findJobByAnyId(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Only owner recruiter or admin can edit
    const recruiterId = job.recruiter?._id
      ? job.recruiter._id.toString()
      : job.recruiter
      ? job.recruiter.toString()
      : null;

    if (recruiterId && recruiterId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only update your own job postings",
      });
    }

    const { title, company, location, type, salary, description, skills } = req.body;
    if (title !== undefined) job.title = title.trim();
    if (company !== undefined) job.company = company.trim();
    if (location !== undefined) job.location = location.trim();
    if (type !== undefined) job.type = type;
    if (salary !== undefined) job.salary = salary;
    if (description !== undefined) job.description = description;
    if (skills !== undefined) {
      job.skills = Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    await job.save();

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only)
const deleteJob = async (req, res, next) => {
  try {
    const job = await findJobByAnyId(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const recruiterId = job.recruiter?._id
      ? job.recruiter._id.toString()
      : job.recruiter
      ? job.recruiter.toString()
      : null;

    if (recruiterId && recruiterId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own job postings",
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/bookmark a job
// @route   POST /api/jobs/:jobId/save
// @access  Private
const saveJob = async (req, res, next) => {
  try {
    const job = await findJobByAnyId(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const existing = await SavedJob.findOne({ user: req.user._id, job: job._id });
    if (existing) {
      return res.status(200).json({
        success: true,
        saved: true,
        message: "Job is already saved",
      });
    }

    await SavedJob.create({ user: req.user._id, job: job._id });

    res.status(201).json({
      success: true,
      saved: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove saved job
// @route   DELETE /api/jobs/:jobId/save
// @access  Private
const removeSavedJob = async (req, res, next) => {
  try {
    const job = await findJobByAnyId(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    await SavedJob.findOneAndDelete({ user: req.user._id, job: job._id });

    res.status(200).json({
      success: true,
      saved: false,
      message: "Job removed from saved list",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved jobs for current user
// @route   GET /api/users/me/saved-jobs
// @access  Private
const getMySavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.find({ user: req.user._id })
      .populate("job")
      .sort("-createdAt");

    const formatted = saved
      .filter((s) => s.job != null)
      .map((s) => ({
        _id: s.job._id,
        id: s.job.numericId || s.job._id,
        title: s.job.title,
        company: s.job.company,
        logo: s.job.logo,
        logoColor: s.job.logoColor,
        location: s.job.location,
        type: s.job.type,
        salary: s.job.salary,
        posted: s.job.posted,
        skills: s.job.skills,
        applicants: s.job.applicantsCount,
        savedAt: s.createdAt,
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

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  saveJob,
  removeSavedJob,
  getMySavedJobs,
  getMyPostedJobs,
};
