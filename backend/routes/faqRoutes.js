const express = require("express");
const router = express.Router();
const Faq = require("../models/Faq");

const defaultFaqs = [
  {
    "question": "How does 100% online email support work at CareerVerse?",
    "answer": "We believe in direct, thoughtful, and documented support without wait times or endless call queues. When you submit a request or email us at careerverse999@gmail.com, our support team immediately reviews your message and delivers comprehensive, personalized assistance directly to your inbox.",
    "category": "Support",
    "order": 1,
    "isActive": true
  },
  {
    "question": "How do students apply for jobs on CareerVerse?",
    "answer": "Students can navigate to the Jobs section, review active openings, and click 'Apply'. If your profile includes an uploaded PDF resume, it is automatically shared with the employer alongside your application. You will also receive an instant confirmation email and live updates whenever the employer reviews or updates your application.",
    "category": "Candidates",
    "order": 2,
    "isActive": true
  },
  {
    "question": "How do organizations list new job openings?",
    "answer": "Organizations and hiring managers can register for a company account, access the dedicated Employer Dashboard, and publish open positions with custom requirements, salaries, and remote/hybrid tags. Candidates apply directly, and applicant resumes are dispatched straight to your hiring inbox.",
    "category": "Employers",
    "order": 3,
    "isActive": true
  },
  {
    "question": "How does the AI Practice Interviewer work?",
    "answer": "Our AI Practice Interview simulator crafts dynamic questions based on your preferred role, senior level, and industry. You can respond via voice or text to receive instant, constructive scoring on communication clarity, technical depth, and confidence.",
    "category": "AI Suite",
    "order": 4,
    "isActive": true
  },
  {
    "question": "What is the CareerVerse Verified badge and how is it awarded?",
    "answer": "The CareerVerse Verified badge recognizes authentic talent and verified hiring entities. Super Administrators evaluate profile completeness, institutional or corporate credentials, and adherence to community guidelines before granting this prestigious badge.",
    "category": "Verification",
    "order": 5,
    "isActive": true
  }
];

// @route   GET /api/faqs
// @desc    Get all active FAQs for public pages (auto-seeds defaults if empty)
// @access  Public
router.get("/", async (req, res) => {
  try {
    let count = await Faq.countDocuments();
    if (count === 0) {
      await Faq.insertMany(defaultFaqs);
    }

    const faqs = await Faq.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    return res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    console.error("[FaqRoute] Error fetching FAQs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
    });
  }
});

module.exports = router;
