const User = require("../models/User");
const Post = require("../models/Post");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Notification = require("../models/Notification");
const { generateToken } = require("../utils/jwt");
const {
  sendUserDeletedByAdminEmail,
  sendPostDeletedByAdminEmail,
  sendOrgDeletedByAdminEmail,
  sendJobDeletedByAdminEmail,
  sendCustomAdminEmail,
  sendVerificationBadgeEmail,
} = require("../services/emailService");

// Auto-seed or guarantee default admin exists
const ensureDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (!existingAdmin) {
      const defaultAdmin = await User.create({
        name: "CareerVerse Administrator",
        email: "admin@careerverse.com",
        password: "Admin123!",
        role: "admin",
        headline: "System Administrator & Platform Moderator",
        location: "System Global",
        isLoggedIn: false,
      });
      console.log("Default admin initialized:", defaultAdmin.email);
    }
  } catch (err) {
    console.warn("Could not check/create default admin:", err.message);
  }
};

// Initialize check on module load
ensureDefaultAdmin();

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both admin email and password",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Ensure default admin exists if someone tries to log in with it
    if (normalizedEmail === "admin@careerverse.com") {
      const adminExists = await User.findOne({ email: "admin@careerverse.com" });
      if (!adminExists) {
        await ensureDefaultAdmin();
      }
    }

    const adminUser = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials or account not authorized as admin",
      });
    }

    const isMatch = await adminUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    adminUser.isLoggedIn = true;
    adminUser.lastLogin = new Date();
    await adminUser.save();

    const token = generateToken(adminUser._id);

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token,
      data: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        headline: adminUser.headline,
        isLoggedIn: true,
        lastLogin: adminUser.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system-wide overview statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrganizations,
      onlineUsers,
      totalPosts,
      totalJobs,
      totalApplications,
    ] = await Promise.all([
      User.countDocuments({ role: { $nin: ["organization", "recruiter", "admin"] } }),
      User.countDocuments({ role: { $in: ["organization", "recruiter"] } }),
      User.countDocuments({ isLoggedIn: true }),
      Post.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrganizations,
        onlineUsers,
        totalPosts,
        totalJobs,
        totalApplications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all candidates / students
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $nin: ["organization", "recruiter", "admin"] } })
      .select("-password")
      .sort({ createdAt: -1 });

    // Fetch counts for each user (posts count, applications count)
    const userIds = users.map((u) => u._id);

    const [postCounts, appCounts] = await Promise.all([
      Post.aggregate([
        { $match: { author: { $in: userIds } } },
        { $group: { _id: "$author", count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $match: { applicant: { $in: userIds } } },
        { $group: { _id: "$applicant", count: { $sum: 1 } } },
      ]),
    ]);

    const postMap = {};
    postCounts.forEach((p) => {
      postMap[p._id.toString()] = p.count;
    });

    const appMap = {};
    appCounts.forEach((a) => {
      appMap[a._id.toString()] = a.count;
    });

    const populatedUsers = users.map((u) => {
      const uObj = u.toObject();
      return {
        ...uObj,
        postsCount: postMap[u._id.toString()] || 0,
        applicationsCount: appMap[u._id.toString()] || 0,
      };
    });

    res.status(200).json({
      success: true,
      count: populatedUsers.length,
      data: populatedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a candidate user and related content
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Cannot delete admin user" });
    }

    const userId = user._id;
    const reason = req.body?.reason || req.query?.reason || "Administrative decision and account termination";

    // Asynchronously dispatch account deletion email with reason to user
    if (user.email) {
      sendUserDeletedByAdminEmail({
        to: user.email,
        recipientName: user.name,
        reason,
      }).catch((err) => console.warn("[Admin] User deletion email error:", err.message));
    }

    // Delete user's posts, applications, notifications
    await Promise.all([
      Post.deleteMany({ author: userId }),
      Application.deleteMany({ applicant: userId }),
      Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] }),
      user.deleteOne(),
    ]);

    res.status(200).json({
      success: true,
      message: "Candidate user and related data deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts by a specific user
// @route   GET /api/admin/users/:id/posts
// @access  Private (Admin)
const getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.params.id })
      .populate("author", "name email headline profilePhoto avatarColor")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any post (Admin moderation)
// @route   DELETE /api/admin/posts/:id
// @access  Private (Admin)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name email");
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const reason = req.body?.reason || req.query?.reason || "Violation of CareerVerse community posting standards";

    // Asynchronously dispatch post deletion email with reason to author
    if (post.author && post.author.email) {
      sendPostDeletedByAdminEmail({
        to: post.author.email,
        recipientName: post.author.name,
        reason,
        postSnippet: post.content ? (post.content.slice(0, 120) + (post.content.length > 120 ? "..." : "")) : "",
      }).catch((err) => console.warn("[Admin] Post deletion email error:", err.message));
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully by admin",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organizations
// @route   GET /api/admin/organizations
// @access  Private (Admin)
const getOrganizations = async (req, res, next) => {
  try {
    const orgs = await User.find({ role: { $in: ["organization", "recruiter"] } })
      .select("-password")
      .sort({ createdAt: -1 });

    const orgIds = orgs.map((o) => o._id);

    // Count jobs per organization
    const jobCounts = await Job.aggregate([
      { $match: { recruiter: { $in: orgIds } } },
      { $group: { _id: "$recruiter", count: { $sum: 1 } } },
    ]);

    const jobMap = {};
    jobCounts.forEach((j) => {
      jobMap[j._id.toString()] = j.count;
    });

    const populatedOrgs = orgs.map((o) => {
      const oObj = o.toObject();
      return {
        ...oObj,
        jobsCount: jobMap[o._id.toString()] || 0,
      };
    });

    res.status(200).json({
      success: true,
      count: populatedOrgs.length,
      data: populatedOrgs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an organization and its jobs
// @route   DELETE /api/admin/organizations/:id
// @access  Private (Admin)
const deleteOrganization = async (req, res, next) => {
  try {
    const org = await User.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    const orgId = org._id;
    const reason = req.body?.reason || req.query?.reason || "Organization account termination and policy review";

    // Asynchronously dispatch account deletion email with reason to organization
    if (org.email) {
      sendOrgDeletedByAdminEmail({
        to: org.email,
        companyName: org.companyName || org.name || "Organization",
        reason,
      }).catch((err) => console.warn("[Admin] Organization deletion email error:", err.message));
    }

    // Find all jobs by this organization
    const jobs = await Job.find({ recruiter: orgId });
    const jobIds = jobs.map((j) => j._id);

    // Delete jobs and all applications for those jobs
    await Promise.all([
      Application.deleteMany({ job: { $in: jobIds } }),
      Job.deleteMany({ recruiter: orgId }),
      Post.deleteMany({ author: orgId }),
      Notification.deleteMany({ $or: [{ recipient: orgId }, { sender: orgId }] }),
      org.deleteOne(),
    ]);

    res.status(200).json({
      success: true,
      message: "Organization and its posted jobs deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jobs posted by a specific organization
// @route   GET /api/admin/organizations/:id/jobs
// @access  Private (Admin)
const getOrganizationJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.params.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any job (Admin moderation)
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin)
const deleteJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id).populate("recruiter", "name email companyName");
    if (!job && !isNaN(req.params.id)) {
      job = await Job.findOne({ numericId: Number(req.params.id) }).populate("recruiter", "name email companyName");
    }

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const reason = req.body?.reason || req.query?.reason || "Job opening removed by administrator moderation";

    // Asynchronously dispatch job deletion email with reason to organization/recruiter
    const recruiterEmail = job.recruiter?.email || job.hrDetails?.email;
    if (recruiterEmail) {
      sendJobDeletedByAdminEmail({
        to: recruiterEmail,
        companyName: job.company || job.recruiter?.companyName || "Organization",
        jobTitle: job.title,
        reason,
      }).catch((err) => console.warn("[Admin] Job deletion email error:", err.message));
    }

    await Promise.all([
      Application.deleteMany({ job: job._id }),
      job.deleteOne(),
    ]);

    res.status(200).json({
      success: true,
      message: "Job and its applications deleted successfully by admin",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all recent posts for moderation
// @route   GET /api/admin/posts
// @access  Private (Admin)
const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email role headline profilePhoto avatarColor")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for moderation
// @route   GET /api/admin/jobs
// @access  Private (Admin)
const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate("recruiter", "name email companyName")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Broadcast a system notification to all users
// @route   POST /api/admin/broadcast
// @access  Private (Admin)
const broadcastNotification = async (req, res, next) => {
  try {
    const { title, text, type = "system" } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Notification text is required" });
    }

    const allUsers = await User.find({ role: { $ne: "admin" } }).select("_id");
    const notifications = allUsers.map((u) => ({
      recipient: u._id,
      sender: req.user._id,
      type,
      title: title || "Platform Announcement",
      text,
      link: "/home",
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      success: true,
      message: `Notification broadcasted to ${notifications.length} users`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle CareerVerse Verified badge for candidate user or organization
// @route   PUT /api/admin/verify/:id
// @access  Private (Admin)
const toggleVerifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User or organization not found" });
    }

    const newStatus = typeof req.body.isVerified === "boolean" ? req.body.isVerified : !user.isVerified;
    user.isVerified = newStatus;
    user.verifiedAt = newStatus ? new Date() : null;
    await user.save();

    // Send a system notification to the verified/unverified user or organization
    try {
      await Notification.create({
        recipient: user._id,
        sender: req.user._id,
        type: "system",
        title: newStatus ? "🌟 You are CareerVerse Verified!" : "Verification Status Updated",
        text: newStatus
          ? "Congratulations! Your account has been officially awarded the prestigious 'CareerVerse Verified' badge by administrators."
          : "Your CareerVerse Verified badge status has been revoked or updated by administrators.",
        link: "/profile",
      });

      // Asynchronously send verification badge email
      if (user.email) {
        sendVerificationBadgeEmail({
          to: user.email,
          recipientName: user.companyName || user.name,
          isVerified: newStatus,
        }).catch((err) => console.warn("[Admin] Verification email error:", err.message));
      }
    } catch (notifErr) {
      console.warn("Could not send verification notification:", notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Successfully ${newStatus ? "verified" : "unverified"} "${user.companyName || user.name}"`,
      data: {
        _id: user._id,
        id: user._id,
        isVerified: user.isVerified,
        verifiedAt: user.verifiedAt,
        name: user.name,
        companyName: user.companyName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send custom email to user or organization
// @route   POST /api/admin/send-email
// @access  Private (Admin)
const sendCustomEmail = async (req, res, next) => {
  try {
    const { to, recipientName, subject, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: "Recipient email and message text are required",
      });
    }

    const mailResult = await sendCustomAdminEmail({
      to: to.trim(),
      recipientName: recipientName || "Member",
      subject: subject ? subject.trim() : "Official Message from CareerVerse Administration",
      message: message.trim(),
    });

    if (mailResult && mailResult.error) {
      return res.status(500).json({
        success: false,
        message: "Failed to dispatch email: " + mailResult.error,
      });
    }

    res.status(200).json({
      success: true,
      message: `Custom email successfully sent to ${to}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginAdmin,
  getAdminStats,
  getUsers,
  deleteUser,
  getUserPosts,
  deletePost,
  getOrganizations,
  deleteOrganization,
  getOrganizationJobs,
  deleteJob,
  getAllPosts,
  getAllJobs,
  broadcastNotification,
  ensureDefaultAdmin,
  toggleVerifyUser,
  sendCustomEmail,
};
