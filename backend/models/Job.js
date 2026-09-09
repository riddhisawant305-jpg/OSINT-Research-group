const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    numericId: {
      type: Number,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    logo: {
      type: String,
      default: "",
      trim: true,
    },
    logoColor: {
      type: String,
      default: "#2563eb",
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Full-time", "Contract", "Remote", "Part-time", "Internship"],
      default: "Full-time",
    },
    salary: {
      type: String,
      default: "Competitive",
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    aboutRole: {
      type: String,
      default: "",
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      default: "Mid-Level",
    },
    workplaceType: {
      type: String,
      enum: ["On-site", "Hybrid", "Remote"],
      default: "On-site",
    },
    hrDetails: {
      name: { type: String, default: "", trim: true },
      email: { type: String, default: "", trim: true },
      phone: { type: String, default: "", trim: true },
    },
    organizationDetails: {
      name: { type: String, default: "", trim: true },
      website: { type: String, default: "", trim: true },
      about: { type: String, default: "", trim: true },
      industry: { type: String, default: "", trim: true },
    },
    skills: {
      type: [String],
      default: [],
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for human-readable 'posted' string like '2d ago'
jobSchema.virtual("posted").get(function () {
  const diff = Date.now() - new Date(this.createdAt).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours <= 0 ? "Just now" : `${hours}h ago`;
  }
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
});

// Auto-populate logo initials from company name if empty
jobSchema.pre("save", function () {
  if (!this.logo && this.company) {
    this.logo = this.company
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
});

module.exports = mongoose.model("Job", jobSchema);
