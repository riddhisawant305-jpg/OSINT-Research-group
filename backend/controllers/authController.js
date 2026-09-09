const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      headline,
      role,
      companyName,
      companyWebsite,
      companyIndustry,
      companySize,
      hrDetails,
      organizationDetails,
      location,
      phone,
      about,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Role can be student, recruiter, or organization
    const userRole =
      role === "organization" || role === "recruiter"
        ? role
        : "student";

    // Random avatar colors for aesthetic profile cards
    const colors = ["#2563eb", "#7c3aed", "#0891b2", "#d97706", "#dc2626", "#16a34a", "#db2777"];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      headline: headline ? headline.trim() : (userRole !== "student" ? "Organization / Recruiter" : ""),
      role: userRole,
      avatarColor,
      location: location ? location.trim() : "India",
      phone: phone ? phone.trim() : "",
      about: about ? about.trim() : "",
      companyName: companyName ? companyName.trim() : (userRole !== "student" ? name.trim() : ""),
      companyWebsite: companyWebsite ? companyWebsite.trim() : "",
      companyIndustry: companyIndustry ? companyIndustry.trim() : "",
      companySize: companySize ? companySize.trim() : "",
      hrDetails: hrDetails || {},
      organizationDetails: organizationDetails || {},
    });

    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      headline: user.headline,
      role: user.role,
      location: user.location,
      phone: user.phone,
      about: user.about,
      skills: user.skills,
      education: user.education,
      educationList: user.educationList,
      experience: user.experience,
      projects: user.projects || [],
      resume: user.resume,
      resumeFileName: user.resumeFileName,
      resumeFileType: user.resumeFileType,
      companyName: user.companyName,
      companyWebsite: user.companyWebsite,
      companyIndustry: user.companyIndustry,
      companySize: user.companySize,
      hrDetails: user.hrDetails,
      organizationDetails: user.organizationDetails,
      profilePhoto: user.profilePhoto,
      avatarColor: user.avatarColor,
      initials: user.initials,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Password field has select: false by default, so we explicitly select it
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      headline: user.headline,
      role: user.role,
      location: user.location,
      phone: user.phone,
      about: user.about,
      skills: user.skills,
      education: user.education,
      educationList: user.educationList,
      experience: user.experience,
      projects: user.projects || [],
      resume: user.resume,
      resumeFileName: user.resumeFileName,
      resumeFileType: user.resumeFileType,
      companyName: user.companyName,
      companyWebsite: user.companyWebsite,
      companyIndustry: user.companyIndustry,
      companySize: user.companySize,
      hrDetails: user.hrDetails,
      organizationDetails: user.organizationDetails,
      profilePhoto: user.profilePhoto,
      avatarColor: user.avatarColor,
      initials: user.initials,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
