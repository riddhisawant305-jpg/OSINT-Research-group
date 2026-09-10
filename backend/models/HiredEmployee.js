const mongoose = require("mongoose");

const hiredEmployeeSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },
    jobId: {
      type: String,
      default: "",
    },
    candidateName: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
    },
    candidateEmail: {
      type: String,
      required: [true, "Candidate email is required"],
      trim: true,
    },
    employeeId: {
      type: String,
      trim: true,
      default: () => `CV-EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    role: {
      type: String,
      required: [true, "Role/Position is required"],
      trim: true,
      default: "Software Engineer",
    },
    salary: {
      type: String,
      trim: true,
      default: "Competitive",
    },
    hiredDate: {
      type: Date,
      default: Date.now,
    },
    joiningDate: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    resume: {
      type: String,
      default: "",
    },
    resumeFileName: {
      type: String,
      default: "Candidate_Resume.pdf",
    },
    notes: {
      type: String,
      trim: true,
      default: "Hired via CareerVerse.",
    },
    status: {
      type: String,
      enum: ["Active", "Onboarding", "Probation", "Full-Time", "Completed"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HiredEmployee", hiredEmployeeSchema);
