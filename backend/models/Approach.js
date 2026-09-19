const mongoose = require("mongoose");

const approachSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ["organization", "candidate"],
      required: true,
    },
    recipientType: {
      type: String,
      enum: ["candidate"],
      default: "candidate",
    },
    status: {
      type: String,
      enum: ["approached", "saved_details", "connected", "dismissed"],
      default: "approached",
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying pair interactions
approachSchema.index({ sender: 1, recipient: 1 });

module.exports = mongoose.model("Approach", approachSchema);
