const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Document expires automatically after 10 minutes (600 seconds)
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("Otp", otpSchema);
