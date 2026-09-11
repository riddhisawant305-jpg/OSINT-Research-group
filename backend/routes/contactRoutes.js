const express = require("express");
const router = express.Router();
const { sendContactSupportEmail } = require("../services/emailService");

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Please provide name, email, and message." });
    }

    if (sendContactSupportEmail) {
      sendContactSupportEmail({ name, email, subject, category, message }).catch((err) => {
        console.error("[ContactRoute] Email error:", err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your message has been delivered to CareerVerse 100% online email support. We'll reply directly to your inbox!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to submit inquiry." });
  }
});

module.exports = router;
