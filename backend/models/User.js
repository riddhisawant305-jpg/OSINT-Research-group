const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, default: "", trim: true },
    fieldOfStudy: { type: String, default: "", trim: true },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, default: "", trim: true },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    duration: { type: String, default: "" },
    current: { type: Boolean, default: false },
    description: { type: String, default: "" },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    technologies: { type: [String], default: [] },
    link: { type: String, default: "", trim: true },
    duration: { type: String, default: "", trim: true },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },

    headline: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "India",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    about: {
      type: String,
      default: "",
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    hobbies: {
      type: [String],
      default: [],
    },

    // Matches the string field in EditProfile.jsx form
    education: {
      type: String,
      default: "",
      trim: true,
    },

    // Structured education records
    educationList: {
      type: [educationSchema],
      default: [],
    },

    // Structured experience records
    experience: {
      type: [experienceSchema],
      default: [],
    },

    // Structured project records
    projects: {
      type: [projectSchema],
      default: [],
    },

    resume: {
      type: String,
      default: "",
    },

    resumeFileName: {
      type: String,
      default: "",
    },

    resumeFileType: {
      type: String,
      default: "",
    },

    resumeUpdatedAt: {
      type: Date,
      default: null,
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    avatarColor: {
      type: String,
      default: "#2563eb",
    },

    role: {
      type: String,
      enum: ["student", "recruiter", "organization", "admin"],
      default: "student",
    },

    isLoggedIn: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // Official CareerVerse verification badge
    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    // Organization specific details
    companyName: {
      type: String,
      default: "",
      trim: true,
    },

    companyWebsite: {
      type: String,
      default: "",
      trim: true,
    },

    companyIndustry: {
      type: String,
      default: "",
      trim: true,
    },

    companySize: {
      type: String,
      default: "",
      trim: true,
    },

    hrDetails: {
      name: { type: String, default: "", trim: true },
      email: { type: String, default: "", trim: true },
      phone: { type: String, default: "", trim: true },
    },

    organizationDetails: {
      overview: { type: String, default: "", trim: true },
      founded: { type: String, default: "", trim: true },
      headquarters: { type: String, default: "", trim: true },
    },

    googleId: {
      type: String,
      default: "",
    },

    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for initials
userSchema.virtual("initials").get(function () {
  if (!this.name) return "?";
  return this.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

// Pre-save hook to hash password if modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour validity
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);