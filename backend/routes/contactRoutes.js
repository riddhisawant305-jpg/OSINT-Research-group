const express = require("express");
const router = express.Router();
const Inquiry = require("../models/Inquiry");
const { sendContactSupportEmail } = require("../services/emailService");

// @route   POST /api/contact
// @desc    Submit support/contact inquiry and persist in database
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide your name, email, and message.",
      });
    }

    // Save inquiry to MongoDB
    const inquiry = await Inquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : "Support Inquiry",
      category: category || "general",
      message: message.trim(),
      status: "pending",
    });

    // Send email alert to admin and confirmation to user
    if (sendContactSupportEmail) {
      sendContactSupportEmail({
        name: inquiry.name,
        email: inquiry.email,
        subject: inquiry.subject,
        category: inquiry.category,
        message: inquiry.message,
      }).catch((err) => {
        console.error("[ContactRoute] Error dispatching email:", err.message);
      });
    }

    return res.status(201).json({
      success: true,
      message: "Thank you! Your message has been received by our 100% online support team. We will review it and reply directly to your email.",
      data: inquiry,
    });
  } catch (error) {
    console.error("[ContactRoute] Submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error submitting contact message.",
    });
  }
});

module.exports = router;
