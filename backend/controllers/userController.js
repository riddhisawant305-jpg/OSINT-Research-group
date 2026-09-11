const User = require("../models/User");
const Post = require("../models/Post");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJob");
const Connection = require("../models/Connection");
const mongoose = require("mongoose");

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public / Private
const getUserById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = user.toObject();

    // If user is an organization or recruiter, attach the jobs they posted
    if (user.role === "recruiter" || user.role === "organization") {
      const Job = require("../models/Job");
      const postedJobs = await Job.find({ recruiter: user._id }).sort("-createdAt");
      userData.postedJobs = postedJobs;
    }

    res.status(200).json({ success: true, data: userData });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const {
      name,
      headline,
      location,
      phone,
      about,
      education,
      skills,
      experience,
      projects,
      profilePhoto,
      resume,
      resumeFileName,
      resumeFileType,
      companyName,
      companyWebsite,
      companyIndustry,
      companySize,
      hrDetails,
      organizationDetails,
      hobbies,
    } = req.body;

    if (hobbies !== undefined && Array.isArray(hobbies)) {
      user.hobbies = Array.from(new Set(hobbies.map(h => String(h).trim()).filter(Boolean)));
    }

    if (name !== undefined) user.name = name.trim();
    if (headline !== undefined) user.headline = headline.trim();
    if (location !== undefined) user.location = location.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (about !== undefined) user.about = about.trim();
    if (education !== undefined) user.education = education.trim();
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (resume !== undefined) user.resume = resume;
    if (resumeFileName !== undefined) user.resumeFileName = resumeFileName;
    if (resumeFileType !== undefined) user.resumeFileType = resumeFileType;
    if (resume) user.resumeUpdatedAt = new Date();
    if (companyName !== undefined) user.companyName = companyName.trim();
    if (companyWebsite !== undefined) user.companyWebsite = companyWebsite.trim();
    if (companyIndustry !== undefined) user.companyIndustry = companyIndustry.trim();
    if (companySize !== undefined) user.companySize = companySize.trim();
    if (hrDetails !== undefined) user.hrDetails = { ...user.hrDetails, ...hrDetails };
    if (organizationDetails !== undefined) user.organizationDetails = { ...user.organizationDetails, ...organizationDetails };

    // Handle experience: array of experience items
    if (experience !== undefined && Array.isArray(experience)) {
      user.experience = experience
        .filter((exp) => exp && (exp.role || exp.company))
        .map((exp) => ({
          role: (exp.role || "Role").trim(),
          company: (exp.company || "Company").trim(),
          location: exp.location ? exp.location.trim() : "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          duration:
            exp.duration ||
            (exp.startDate && exp.endDate
              ? `${exp.startDate} - ${exp.endDate}`
              : "Present"),
          current: !!exp.current,
          description: exp.description ? exp.description.trim() : "",
        }));
    }

    // Handle projects: array of project items
    if (projects !== undefined && Array.isArray(projects)) {
      user.projects = projects
        .filter((proj) => proj && (proj.title || proj.name))
        .map((proj) => ({
          title: (proj.title || proj.name || "Project").trim(),
          description: proj.description ? proj.description.trim() : "",
          technologies: Array.isArray(proj.technologies)
            ? proj.technologies.map((t) => String(t).trim()).filter(Boolean)
            : typeof proj.technologies === "string"
            ? proj.technologies.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          link: proj.link ? proj.link.trim() : "",
          duration: proj.duration ? proj.duration.trim() : "",
        }));
    }

    // Handle skills: can be an array of strings or comma-separated string
    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.skills = Array.from(
          new Set(skills.map((s) => String(s).trim()).filter(Boolean))
        );
      } else if (typeof skills === "string") {
        user.skills = Array.from(
          new Set(
            skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          )
        );
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a skill
// @route   POST /api/users/me/skills
// @access  Private
const addSkill = async (req, res, next) => {
  try {
    const { skill } = req.body;
    if (!skill || !skill.trim()) {
      return res.status(400).json({ success: false, message: "Skill is required" });
    }

    const trimmedSkill = skill.trim();
    const user = await User.findById(req.user._id);

    // Case-insensitive check to prevent duplicate skills
    const exists = user.skills.some(
      (s) => s.toLowerCase() === trimmedSkill.toLowerCase()
    );

    if (!exists) {
      user.skills.push(trimmedSkill);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Skill added successfully",
      data: user.skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update/replace full skills array
// @route   PUT /api/users/me/skills
// @access  Private
const updateSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: "Skills must be an array" });
    }

    const user = await User.findById(req.user._id);
    user.skills = Array.from(
      new Set(skills.map((s) => String(s).trim()).filter(Boolean))
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: "Skills updated successfully",
      data: user.skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a skill
// @route   DELETE /api/users/me/skills/:skill
// @access  Private
const removeSkill = async (req, res, next) => {
  try {
    const skillToRemove = decodeURIComponent(req.params.skill).trim().toLowerCase();
    const user = await User.findById(req.user._id);

    user.skills = user.skills.filter(
      (s) => s.toLowerCase() !== skillToRemove
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: "Skill removed successfully",
      data: user.skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add structured education
// @route   POST /api/users/me/education
// @access  Private
const addEducation = async (req, res, next) => {
  try {
    const { institution, degree, fieldOfStudy, startDate, endDate, description } = req.body;
    if (!institution || !institution.trim()) {
      return res.status(400).json({ success: false, message: "Institution is required" });
    }

    const user = await User.findById(req.user._id);
    user.educationList.push({
      institution: institution.trim(),
      degree: degree ? degree.trim() : "",
      fieldOfStudy: fieldOfStudy ? fieldOfStudy.trim() : "",
      startDate: startDate || "",
      endDate: endDate || "",
      description: description || "",
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Education added successfully",
      data: user.educationList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update education item
// @route   PUT /api/users/me/education/:educationId
// @access  Private
const updateEducation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const edu = user.educationList.id(req.params.educationId);
    if (!edu) {
      return res.status(404).json({ success: false, message: "Education record not found" });
    }

    const { institution, degree, fieldOfStudy, startDate, endDate, description } = req.body;
    if (institution !== undefined) edu.institution = institution.trim();
    if (degree !== undefined) edu.degree = degree.trim();
    if (fieldOfStudy !== undefined) edu.fieldOfStudy = fieldOfStudy.trim();
    if (startDate !== undefined) edu.startDate = startDate;
    if (endDate !== undefined) edu.endDate = endDate;
    if (description !== undefined) edu.description = description;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Education updated successfully",
      data: user.educationList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete education item
// @route   DELETE /api/users/me/education/:educationId
// @access  Private
const deleteEducation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const edu = user.educationList.id(req.params.educationId);
    if (!edu) {
      return res.status(404).json({ success: false, message: "Education record not found" });
    }

    user.educationList.pull(req.params.educationId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Education record removed",
      data: user.educationList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add structured experience
// @route   POST /api/users/me/experience
// @access  Private
const addExperience = async (req, res, next) => {
  try {
    const { role, company, location, startDate, endDate, duration, current, description } = req.body;
    if (!role || !company) {
      return res.status(400).json({ success: false, message: "Role and company are required" });
    }

    const user = await User.findById(req.user._id);
    user.experience.push({
      role: role.trim(),
      company: company.trim(),
      location: location ? location.trim() : "",
      startDate: startDate || "",
      endDate: endDate || "",
      duration: duration || (startDate && endDate ? `${startDate} - ${endDate}` : "Present"),
      current: !!current,
      description: description || "",
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Experience added successfully",
      data: user.experience,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update experience item
// @route   PUT /api/users/me/experience/:experienceId
// @access  Private
const updateExperience = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const exp = user.experience.id(req.params.experienceId);
    if (!exp) {
      return res.status(404).json({ success: false, message: "Experience record not found" });
    }

    const { role, company, location, startDate, endDate, duration, current, description } = req.body;
    if (role !== undefined) exp.role = role.trim();
    if (company !== undefined) exp.company = company.trim();
    if (location !== undefined) exp.location = location.trim();
    if (startDate !== undefined) exp.startDate = startDate;
    if (endDate !== undefined) exp.endDate = endDate;
    if (duration !== undefined) exp.duration = duration;
    if (current !== undefined) exp.current = !!current;
    if (description !== undefined) exp.description = description;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Experience updated successfully",
      data: user.experience,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete experience item
// @route   DELETE /api/users/me/experience/:experienceId
// @access  Private
const deleteExperience = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const exp = user.experience.id(req.params.experienceId);
    if (!exp) {
      return res.status(404).json({ success: false, message: "Experience record not found" });
    }

    user.experience.pull(req.params.experienceId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Experience record removed",
      data: user.experience,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add project
// @route   POST /api/users/me/projects
// @access  Private
const addProject = async (req, res, next) => {
  try {
    const { title, description, technologies, link, duration } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Project title is required" });
    }

    const user = await User.findById(req.user._id);
    user.projects.push({
      title: title.trim(),
      description: description ? description.trim() : "",
      technologies: Array.isArray(technologies)
        ? technologies.map((t) => String(t).trim()).filter(Boolean)
        : typeof technologies === "string"
        ? technologies.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      link: link ? link.trim() : "",
      duration: duration ? duration.trim() : "",
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Project added successfully",
      data: user.projects,
      projects: user.projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/users/me/projects/:projectId
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const proj = user.projects.id(req.params.projectId);
    if (!proj) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const { title, description, technologies, link, duration } = req.body;
    if (title !== undefined) proj.title = title.trim();
    if (description !== undefined) proj.description = description.trim();
    if (technologies !== undefined) {
      proj.technologies = Array.isArray(technologies)
        ? technologies.map((t) => String(t).trim()).filter(Boolean)
        : typeof technologies === "string"
        ? technologies.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    }
    if (link !== undefined) proj.link = link.trim();
    if (duration !== undefined) proj.duration = duration.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: user.projects,
      projects: user.projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/users/me/projects/:projectId
// @access  Private
const deleteProject = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const proj = user.projects.id(req.params.projectId);
    if (!proj) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    user.projects.pull(req.params.projectId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Project removed",
      data: user.projects,
      projects: user.projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/users/me/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Parallel counts from database
    const [
      postsCount,
      applicationsCount,
      savedJobsCount,
      connectionsCount,
      recentApplications,
      recentPosts,
    ] = await Promise.all([
      Post.countDocuments({ author: userId }),
      Application.countDocuments({ applicant: userId }),
      SavedJob.countDocuments({ user: userId }),
      Connection.countDocuments({
        $or: [
          { requester: userId, status: "accepted" },
          { recipient: userId, status: "accepted" },
        ],
      }),
      Application.find({ applicant: userId })
        .populate("job", "title company location salary type")
        .sort("-createdAt")
        .limit(5),
      Post.find({ author: userId }).sort("-createdAt").limit(5),
    ]);

    // Calculate real profile strength percentage based on profile completeness
    let strength = 20; // Base score for having an account
    if (user.headline && user.headline.length > 5) strength += 15;
    if (user.about && user.about.length > 10) strength += 15;
    if (user.location) strength += 10;
    if (user.skills && user.skills.length >= 3) strength += 15;
    if (user.education || (user.educationList && user.educationList.length > 0)) strength += 10;
    if (user.experience && user.experience.length > 0) strength += 10;
    if (user.projects && user.projects.length > 0) strength += 10;
    strength = Math.min(100, strength);

    // Dynamic career stats derived from real numbers + baseline multipliers
    const careerStats = {
      profileStrength: strength,
      applicationViews: Math.max(applicationsCount * 12, 14),
      profileViews: Math.max(connectionsCount * 8 + postsCount * 15, 25),
      searchAppearances: Math.max(((user.skills && user.skills.length) || 1) * 14 + postsCount * 6, 18),
      interviewInvites: applicationsCount > 0 ? Math.floor(applicationsCount / 3) : 0,
      connectionRequests: await Connection.countDocuments({
        recipient: userId,
        status: "pending",
      }),
      postsCount,
      applicationsCount,
      savedJobsCount,
      connectionsCount,
    };

    // Skill progress calculations based on user's real skills
    const rawSkills =
      user.skills && user.skills.length > 0
        ? user.skills
        : ["React", "JavaScript", "Problem Solving", "Communication"];
    const skillProgress = rawSkills.map((skill, idx) => ({
      name: skill,
      skill,
      level: Math.min(95, 60 + ((idx * 11) % 35)),
    }));

    // Organization specific stats and jobs
    let recruiterStats = null;
    let postedJobs = [];
    let hiredEmployees = [];
    if (user.role === "recruiter" || user.role === "organization") {
      const Job = require("../models/Job");
      const jobQuery = {
        $or: [{ recruiter: userId }, { "hrDetails.email": user.email }],
      };
      postedJobs = await Job.find(jobQuery).sort("-createdAt");
      const jobIds = postedJobs.map((j) => j._id);
      const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
      const shortlisted = await Application.countDocuments({
        job: { $in: jobIds },
        status: { $regex: /^shortlisted$/i },
      });
      const accepted = await Application.countDocuments({
        job: { $in: jobIds },
        status: { $regex: /^(accepted|hired)$/i },
      });

      const HiredEmployee = require("../models/HiredEmployee");
      hiredEmployees = await HiredEmployee.find({ organization: userId }).sort("-createdAt");

      recruiterStats = {
        jobsPostedCount: postedJobs.length,
        totalApplicationsCount: totalApplications,
        shortlistedCount: shortlisted,
        acceptedCount: Math.max(accepted, hiredEmployees.length),
      };
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          headline: user.headline,
          email: user.email,
          role: user.role,
          location: user.location,
          about: user.about,
          skills: user.skills,
          education: user.education,
          experience: user.experience,
          projects: user.projects || [],
          resume: user.resume,
          resumeFileName: user.resumeFileName,
          companyName: user.companyName,
          companyWebsite: user.companyWebsite,
          companyIndustry: user.companyIndustry,
          companySize: user.companySize,
          hrDetails: user.hrDetails,
          organizationDetails: user.organizationDetails,
          initials: user.initials,
          avatarColor: user.avatarColor,
          profilePhoto: user.profilePhoto || "",
          isVerified: !!user.isVerified,
        },
        careerStats,
        recruiterStats,
        postedJobs,
        hiredEmployees,
        skillProgress,
        recentApplications,
        recentPosts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/me/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let photoUrl = "";
    if (req.file) {
      photoUrl = `/uploads/avatars/${req.file.filename}`;
    } else if (req.body && req.body.profilePhoto) {
      photoUrl = req.body.profilePhoto;
    }

    if (!photoUrl) {
      return res.status(400).json({ success: false, message: "No image file or photo provided" });
    }

    user.profilePhoto = photoUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      data: user,
      profilePhoto: photoUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all hired employees for current organization
// @route   GET /api/users/me/hired-employees
// @access  Private (Organization/Recruiter)
const getHiredEmployees = async (req, res, next) => {
  try {
    const HiredEmployee = require("../models/HiredEmployee");
    const hired = await HiredEmployee.find({ organization: req.user._id }).sort("-createdAt");
    res.status(200).json({
      success: true,
      count: hired.length,
      data: hired,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a hired employee manually
// @route   POST /api/users/me/hired-employees
// @access  Private (Organization/Recruiter)
const createHiredEmployee = async (req, res, next) => {
  try {
    const HiredEmployee = require("../models/HiredEmployee");
    const {
      candidateName,
      candidateEmail,
      employeeId,
      role,
      salary,
      hiredDate,
      joiningDate,
      resume,
      resumeFileName,
      notes,
      status,
    } = req.body;

    if (!candidateName || !candidateEmail) {
      return res.status(400).json({
        success: false,
        message: "Candidate name and email are required",
      });
    }

    const newHired = await HiredEmployee.create({
      organization: req.user._id,
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim(),
      employeeId: employeeId ? employeeId.trim() : `CV-EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      role: role ? role.trim() : "Software Engineer",
      salary: salary ? salary.trim() : "Competitive",
      hiredDate: hiredDate ? new Date(hiredDate) : new Date(),
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      resume: resume || "",
      resumeFileName: resumeFileName || "Candidate_Resume.pdf",
      notes: notes ? notes.trim() : "Hired via CareerVerse.",
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Hired employee added successfully",
      data: newHired,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a hired employee's details
// @route   PUT /api/users/me/hired-employees/:id
// @access  Private (Organization/Recruiter)
const updateHiredEmployee = async (req, res, next) => {
  try {
    const HiredEmployee = require("../models/HiredEmployee");
    const hired = await HiredEmployee.findOne({
      _id: req.params.id,
      organization: req.user._id,
    });

    if (!hired) {
      return res.status(404).json({
        success: false,
        message: "Hired employee record not found",
      });
    }

    const {
      candidateName,
      candidateEmail,
      employeeId,
      role,
      salary,
      hiredDate,
      joiningDate,
      resume,
      resumeFileName,
      notes,
      status,
    } = req.body;

    if (candidateName !== undefined) hired.candidateName = candidateName.trim();
    if (candidateEmail !== undefined) hired.candidateEmail = candidateEmail.trim();
    if (employeeId !== undefined) hired.employeeId = employeeId.trim();
    if (role !== undefined) hired.role = role.trim();
    if (salary !== undefined) hired.salary = salary.trim();
    if (hiredDate !== undefined) hired.hiredDate = new Date(hiredDate);
    if (joiningDate !== undefined) hired.joiningDate = new Date(joiningDate);
    if (resume !== undefined) hired.resume = resume;
    if (resumeFileName !== undefined) hired.resumeFileName = resumeFileName;
    if (notes !== undefined) hired.notes = notes.trim();
    if (status !== undefined) hired.status = status;

    await hired.save();

    res.status(200).json({
      success: true,
      message: "Hired employee details updated successfully",
      data: hired,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a hired employee record
// @route   DELETE /api/users/me/hired-employees/:id
// @access  Private (Organization/Recruiter)
const deleteHiredEmployee = async (req, res, next) => {
  try {
    const HiredEmployee = require("../models/HiredEmployee");
    const hired = await HiredEmployee.findOneAndDelete({
      _id: req.params.id,
      organization: req.user._id,
    });

    if (!hired) {
      return res.status(404).json({
        success: false,
        message: "Hired employee record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Candidate removed from Hired list",
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
