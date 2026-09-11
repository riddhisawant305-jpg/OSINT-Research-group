const mongoose = require("mongoose");

const InquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: ["general", "candidate", "organization", "technical", "feedback", "moderation", "other"],
      default: "general",
    },
    subject: {
      type: String,
      default: "Support Inquiry",
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message content is required"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "closed"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inquiry", InquirySchema);
