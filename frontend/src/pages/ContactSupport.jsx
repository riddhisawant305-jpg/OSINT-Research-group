import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  CheckCircle,
  HelpCircle,
  Clock,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import API from "../api/client";
import "./ContactSupport.css";

const defaultFaqsList = [
  {
    q: "How does 100% online email support work at CareerVerse?",
    a: "We believe in direct, thoughtful, and documented support without wait times or endless call queues. When you submit a request or email us at careerverse999@gmail.com, our support team immediately reviews your message and delivers comprehensive, personalized assistance directly to your inbox."
  },
  {
    q: "How do students apply for jobs on CareerVerse?",
    a: "Students can navigate to the Jobs section, review active openings, and click 'Apply'. If your profile includes an uploaded PDF resume, it is automatically shared with the employer alongside your application. You will also receive an instant confirmation email and live updates whenever the employer reviews or updates your application."
  },
  {
    q: "How do organizations list new job openings?",
    a: "Hiring organizations and recruiters can register with their work email or Google account, navigate to their Dashboard, and create new job openings specifying title, location, salary, requirements, and workplace type. When candidates apply, the organization receives an immediate email notification with candidate information and the applicant's resume attached."
  },
  {
    q: "What is the CareerVerse Verified Badge?",
    a: "The CareerVerse Verified badge (marked with a blue checkmark) is an official platform accreditation granted by Super Administrators to vetted candidates and legitimate hiring organizations to build high trust and prevent fraudulent activity."
  },
  {
    q: "How does the AI Career Suite assist job seekers?",
    a: "Our AI suite includes a Gemini-powered Resume Analyzer (offering actionable scoring and ATS tips), an interactive Mock Interview simulator, and an AI Career Mentor for strategic career coaching."
  }
];

function ContactSupport() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Dynamic FAQs state
  const [faqs, setFaqs] = useState(defaultFaqsList);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  useEffect(() => {
    let mounted = true;
    const fetchFaqs = async () => {
      try {
        const res = await API.get("/faqs");
        if (mounted && res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setFaqs(res.data.data.map(f => ({ q: f.question, a: f.answer, id: f._id })));
        }
      } catch (err) {
        console.warn("Using fallback FAQs:", err.message);
      }
    };
    fetchFaqs();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await API.post("/contact", form);
      setSubmitted(true);
      setForm({
        name: "",
        email: "",
        subject: "",
        category: "general",
        message: ""
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to send inquiry. Please try again or email us directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyEmail = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("careerverse999@gmail.com");
      } else {
        const el = document.createElement("textarea");
        el.value = "careerverse999@gmail.com";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
    } catch (e) {
      // ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero-badge">
          <Mail size={16} /> 24/7 Dedicated Online Assistance
        </div>
        <h1>
          Contact & <span>Online Support</span>
        </h1>
        <p className="contact-hero-sub">
          Have a question, feedback, or need assistance? Our team is dedicated to providing prompt, attentive support to both students and organizations.
        </p>
      </section>

      {/* Featured 100% Online Support Banner */}
      <section className="online-support-highlight">
        <div className="highlight-icon-wrap">
          <Sparkles size={28} />
        </div>
        <div className="highlight-content">
          <h3>100% Dedicated Online Support via Direct Email Communication</h3>
          <p>
            At CareerVerse, we prioritize speed, clarity, and documentation. We provide <strong>total online support via direct email communication</strong>, ensuring you receive detailed, personalized solutions directly from our engineering and support specialists without sitting on hold. Every question from candidates and recruiters receives our undivided attention.
          </p>
          <div className="highlight-badges">
            <div className="h-badge">
              <Mail size={16} />
              <span>Direct Desk: <strong>careerverse999@gmail.com</strong></span>
            </div>
            <div className="h-badge">
              <Clock size={16} />
              <span>Typical Response Time: <strong>Within 2–4 Business Hours</strong></span>
            </div>
            <div className="h-badge">
              <ShieldCheck size={16} />
              <span>Human Assistance: <strong>Attentive, Documented & Secure</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form & Info Grid */}
      <section className="contact-grid">
        {/* Contact Form */}
        <div className="contact-form-card">
          <h2>Send Us a Message</h2>
          <p className="form-sub">
            Fill out the form below and our team will reply directly to your email address.
          </p>

          {submitted ? (
            <div className="form-success-box">
              <CheckCircle size={44} color="#16a34a" />
              <h3>Message Dispatched Successfully!</h3>
              <p>
                Thank you for reaching out. We have received your inquiry and our support team will respond to your email address shortly.
              </p>
              <button className="btn-send-another" onClick={() => setSubmitted(false)}>
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              {error && <div className="form-error-banner">{error}</div>}

              <div className="form-row">
                <div className="form-group">
                  <label>Your Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Alex Johnson"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Your Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Inquiry Category *</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    <option value="general">General Platform Inquiry</option>
                    <option value="candidate">Candidate / Student Support</option>
                    <option value="organization">Organization / Recruiter Help</option>
                    <option value="technical">Bug Report / Technical Issue</option>
                    <option value="feedback">Feedback & Feature Requests</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="e.g. Question regarding job application status"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Message Content *</label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Describe your inquiry or question in detail. The more context you provide, the faster we can assist you..."
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="submit-contact-btn" disabled={submitting}>
                {submitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send size={16} /> Send Online Inquiry
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Quick Info & Direct Links Card */}
        <div className="contact-sidebar">
          <div className="sidebar-card">
            <h3>Direct Email Desk</h3>
            <p className="sidebar-desc">
              Prefer writing directly from your favorite email client? Reach our official online support team directly:
            </p>
            <div className="direct-email-actions">
              <a
                href="mailto:careerverse999@gmail.com?subject=CareerVerse%20Support%20Inquiry"
                className="email-action-link"
              >
                <Mail size={18} /> careerverse999@gmail.com
              </a>

              <div className="direct-email-buttons">
                <a
                  href="mailto:careerverse999@gmail.com?subject=CareerVerse%20Support%20Inquiry"
                  className="btn-open-email"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <Mail size={14} /> Open Mail Client
                </a>

                <button
                  type="button"
                  className="btn-copy-email"
                  onClick={handleCopyEmail}
                >
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{copied ? "Copied to Clipboard!" : "Copy Email"}</span>
                </button>

                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=careerverse999@gmail.com&su=CareerVerse%20Support%20Inquiry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-open-gmail"
                >
                  <ExternalLink size={14} /> Open in Gmail Web
                </a>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Why Online Support?</h3>
            <ul className="support-perks-list">
              <li>
                <CheckCircle size={16} color="#2563eb" />
                <span><strong>Thoughtful Answers:</strong> Real engineers and hiring experts review your inquiry carefully.</span>
              </li>
              <li>
                <CheckCircle size={16} color="#2563eb" />
                <span><strong>No Waiting on Hold:</strong> Send your question anytime, day or night, and receive a thorough reply.</span>
              </li>
              <li>
                <CheckCircle size={16} color="#2563eb" />
                <span><strong>Documented Record:</strong> Easily keep track of communications and resume status in your inbox.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="section-head">
          <h2>Frequently Asked Questions</h2>
          <p>Quick answers to common questions about CareerVerse</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button className="faq-question" onClick={() => toggleFaq(idx)}>
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isOpen && <div className="faq-answer"><p>{faq.a}</p></div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default ContactSupport;
