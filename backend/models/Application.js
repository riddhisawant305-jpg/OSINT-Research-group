const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant user ID is required"],
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
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
    coverLetter: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Shortlisted", "Rejected", "Accepted"],
      default: "Applied",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent applying to the same job multiple times
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
