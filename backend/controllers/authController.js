const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} = require("../services/emailService");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      isLoggedIn: true,
      lastLogin: new Date(),
    });

    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      headline: user.headline,
      role: user.role,
      isLoggedIn: true,
      lastLogin: user.lastLogin,
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
      isVerified: user.isVerified || false,
      createdAt: user.createdAt,
    };

    // Asynchronously dispatch welcome email to registered address
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
      role: user.role,
    }).catch((err) => console.warn("[Auth] Failed to send welcome email:", err.message));

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

    user.isLoggedIn = true;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      headline: user.headline,
      role: user.role,
      isLoggedIn: user.isLoggedIn,
      lastLogin: user.lastLogin,
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
      isVerified: user.isVerified || false,
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
// @access  Private / Optional
const logout = async (req, res, next) => {
  try {
    if (req.user && req.user._id) {
      await User.findByIdAndUpdate(req.user._id, { isLoggedIn: false });
    }
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth sign-in & sign-up
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { credential, role } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential token is required",
      });
    }

    let payload;
    if (process.env.NODE_ENV !== "production" && credential.startsWith("dev_mock_google_")) {
      const parts = credential.split(":");
      const mockEmail = parts[1] || "dhotreaaryan2006@gmail.com";
      const mockName = parts[2] || "Aaryan Dhotre";
      payload = {
        email: mockEmail,
        name: mockName,
        picture: "https://lh3.googleusercontent.com/a/default-user",
        sub: "mock_google_" + Buffer.from(mockEmail).toString("hex"),
      };
    } else {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        return res.status(401).json({
          success: false,
          message: "Invalid Google credential token: " + verifyErr.message,
        });
      }
    }

    const { email, name, picture, sub: googleId } = payload;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account does not have an email address associated",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const userRole = role === "organization" || role === "recruiter" ? role : "student";
      const colors = ["#2563eb", "#7c3aed", "#0891b2", "#d97706", "#dc2626", "#16a34a", "#db2777"];
      const avatarColor = colors[Math.floor(Math.random() * colors.length)];
      const randomPassword = crypto.randomBytes(16).toString("hex") + "Aa1!";

      user = await User.create({
        name: name || (userRole === "organization" ? "Hiring Organization" : "CareerVerse Member"),
        email: normalizedEmail,
        password: randomPassword,
        googleId,
        profilePhoto: picture || "",
        headline: userRole !== "student" ? "Organization / Recruiter" : "CareerVerse Professional",
        role: userRole,
        avatarColor,
        companyName: userRole !== "student" ? (name || "Organization") : "",
        isLoggedIn: true,
        lastLogin: new Date(),
      });

      // Dispatch welcome email asynchronously
      sendWelcomeEmail({
        to: user.email,
        name: user.name,
        role: user.role,
      }).catch((err) => console.warn("[Auth] Failed to send welcome email to Google user:", err.message));
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (picture && !user.profilePhoto) {
        user.profilePhoto = picture;
      }
      user.isLoggedIn = true;
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      headline: user.headline,
      role: user.role,
      isLoggedIn: true,
      lastLogin: user.lastLogin,
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
      isVerified: user.isVerified || false,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: isNewUser ? "Account created and logged in with Google" : "Logged in successfully with Google",
      token,
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered email address",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      recipientName: user.name,
      resetUrl,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to registered email.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset link is invalid or has expired",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send confirmation email
    sendPasswordResetSuccessEmail({
      to: user.email,
      recipientName: user.name,
    }).catch((err) => console.warn("[Auth] Failed to send reset success email:", err.message));

    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Password has been updated successfully. You are now logged in.",
      token: jwtToken,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
};
