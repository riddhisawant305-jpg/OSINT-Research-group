import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  Users,
  Bot,
  FileText,
  Mic,
  ShieldCheck,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Building2,
  GraduationCap,
  Mail,
  Zap,
  Star,
  Check
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import Footer from "../component/Footer";
import "./Welcome.css";

const defaultFaqsList = [
  {
    q: "What is CareerVerse and how is it different?",
    a: "CareerVerse is a modern hiring and professional ecosystem designed for the new generation. Unlike traditional job boards, CareerVerse bridges student ambition with industry opportunity through integrated AI career tools (resume analyzer, mock interviews, career mentor), transparent application tracking, and verified candidate badges."
  },
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
    a: "Organizations and hiring managers can register for a company account, access the dedicated Employer Dashboard, and publish open positions with custom requirements, salaries, and remote/hybrid tags. Candidates apply directly, and applicant resumes are dispatched straight to your hiring inbox."
  },
  {
    q: "How does the AI Practice Interviewer work?",
    a: "Our AI Practice Interview simulator crafts dynamic questions based on your preferred role, senior level, and industry. You can respond via voice or text to receive instant, constructive scoring on communication clarity, technical depth, and confidence."
  },
  {
    q: "What is the CareerVerse Verified badge and how is it awarded?",
    a: "The CareerVerse Verified badge recognizes authentic talent and verified hiring entities. Super Administrators evaluate profile completeness, institutional or corporate credentials, and adherence to community guidelines before granting this prestigious badge."
  }
];

function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOrg = user && (user.role === "organization" || user.role === "recruiter");

  const [faqs, setFaqs] = useState(defaultFaqsList);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeJourneyTab, setActiveJourneyTab] = useState("candidate");

  useEffect(() => {
    let mounted = true;
    const loadFaqs = async () => {
      try {
        const res = await API.get("/faqs");
        if (mounted && res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setFaqs(res.data.data.map(f => ({ q: f.question, a: f.answer, id: f._id })));
        }
      } catch (err) {
        console.warn("Using fallback landing FAQs:", err.message);
      }
    };
    loadFaqs();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (user) {
      navigate(isOrg ? "/dashboard" : "/home", { replace: true });
    }
  }, [user, isOrg, navigate]);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleFeatureClick = (path) => {
    navigate("/login", { state: { from: { pathname: path } } });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="landing-page-root">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP NAVIGATION BAR                                         */}
      {/* ------------------------------------------------------------- */}
      <header className="landing-navbar">
        <div className="landing-nav-container">
          <Link to="/" className="landing-brand">
            <div className="brand-badge">CV</div>
            <span className="brand-name">
              Career<span>Verse</span>
            </span>
          </Link>

          <nav className="landing-nav-links">
            <button type="button" onClick={() => scrollToSection("features")} className="nav-anchor">
              Features
            </button>
            <button type="button" onClick={() => scrollToSection("ai-suite")} className="nav-anchor">
              AI Suite
            </button>
            <button type="button" onClick={() => scrollToSection("for-who")} className="nav-anchor">
              For Who?
            </button>
            <button type="button" onClick={() => scrollToSection("how-it-works")} className="nav-anchor">
              How It Works
            </button>
            <button type="button" onClick={() => scrollToSection("faqs")} className="nav-anchor">
              FAQs
            </button>
            <Link to="/about" className="nav-anchor">
              About Us
            </Link>
          </nav>

          <div className="landing-nav-actions">
            {user ? (
              <button
                className="landing-primary-btn"
                onClick={() => navigate(isOrg ? "/dashboard" : "/home")}
              >
                {isOrg ? "Organization Dashboard" : "Go to Your Feed"} <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button
                  className="landing-secondary-btn"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </button>
                <button
                  className="landing-primary-btn"
                  onClick={() => navigate("/signup")}
                >
                  Get Started Free <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SECTION                                               */}
      {/* ------------------------------------------------------------- */}
      <section className="landing-hero">
        <div className="landing-hero-container">
          <div className="hero-pill-badge">
            <Sparkles size={16} className="hero-badge-sparkle" />
            <span>The Next-Generation Hiring & Career Ecosystem</span>
          </div>

          <h1 className="landing-hero-title">
            Where Student <span>Potential</span> Meets Industry <span>Opportunity</span>
          </h1>

          <p className="landing-hero-subtitle">
            A unified platform connecting ambitious students and candidates with deserving organizations.
            Explore verified job openings, practice with AI interview simulators, analyze your resume, and grow your professional network.
          </p>

          <div className="landing-hero-cta-group">
            {user ? (
              <button
                className="hero-btn-primary"
                onClick={() => navigate(isOrg ? "/dashboard" : "/home")}
              >
                {isOrg ? "Manage Job Postings" : "Explore Active Opportunities"} <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button
                  className="hero-btn-primary"
                  onClick={() => navigate("/signup?role=candidate")}
                >
                  Join as Candidate <ArrowRight size={18} />
                </button>
                <button
                  className="hero-btn-secondary"
                  onClick={() => navigate("/signup?role=organization")}
                >
                  <Building2 size={18} /> Hire Talent (For Companies)
                </button>
              </>
            )}
          </div>

          {/* Hero Visual Showcase */}
          <div className="landing-hero-mockup-wrapper">
            <div className="mockup-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <span className="mockup-title">CareerVerse Interactive Platform Preview</span>
            </div>
            <div className="mockup-grid">
              <div className="mockup-panel">
                <div className="mockup-pill blue">Candidate Hub</div>
                <h4>Verified Profile & Applications</h4>
                <p>Attach your PDF resume and receive real-time email status updates when employers review your submission.</p>
                <div className="mockup-feature-badge">
                  <ShieldCheck size={14} color="#2563eb" /> CareerVerse Verified Candidate
                </div>
              </div>
              <div className="mockup-panel center-glow">
                <div className="mockup-pill purple">AI Career Suite</div>
                <h4>AI Mentor & Mock Interview</h4>
                <p>Simulate voice & text interviews tailored to your exact industry, receiving actionable feedback on clarity and confidence.</p>
                <div className="mockup-score-tag">
                  <Bot size={15} /> 94% Preparedness Score
                </div>
              </div>
              <div className="mockup-panel">
                <div className="mockup-pill green">Employer Desk</div>
                <h4>Instant Recruiter Pipeline</h4>
                <p>Publish job openings with custom tags. Receive applications with candidate resumes forwarded straight to your inbox.</p>
                <div className="mockup-feature-badge">
                  <Building2 size={14} color="#16a34a" /> 0% Recruiting Fees
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. TWO HUBS: STUDENTS VS EMPLOYERS                            */}
      {/* ------------------------------------------------------------- */}
      <section id="for-who" className="landing-section dark-subtle">
        <div className="landing-section-container">
          <div className="section-head-center">
            <div className="section-eyebrow">A Purpose-Built Ecosystem</div>
            <h2>Designed for Both Sides of the Hiring Table</h2>
            <p>Whether you are taking your first step into industry or scaling a high-performance engineering team.</p>
          </div>

          <div className="two-hubs-grid">
            {/* Student Hub Card */}
            <div className="hub-card student">
              <div className="hub-badge blue">
                <GraduationCap size={20} /> For Students & Candidates
              </div>
              <h3>Launch and Accelerate Your Career</h3>
              <p className="hub-desc">
                Access genuine job openings, optimize your resume with Gemini AI, and connect with ambitious peers in your field.
              </p>
              <ul className="hub-features">
                <li>
                  <Check size={18} color="#2563eb" />
                  <span><strong>Direct Job Applications:</strong> Apply seamlessly with your uploaded PDF resume automatically attached.</span>
                </li>
                <li>
                  <Check size={18} color="#2563eb" />
                  <span><strong>Live Status Tracking:</strong> Never wonder about application progress with transparent email milestones.</span>
                </li>
                <li>
                  <Check size={18} color="#2563eb" />
                  <span><strong>AI Career Mentor:</strong> 24/7 strategic guidance, roadmap exploration, and personalized skill tips.</span>
                </li>
                <li>
                  <Check size={18} color="#2563eb" />
                  <span><strong>Professional Peer Network:</strong> Post technical updates, share projects, and grow your connections.</span>
                </li>
              </ul>
              <button
                className="hub-cta-btn blue"
                onClick={() => navigate(user ? "/jobs" : "/signup?role=candidate")}
              >
                {user ? "Browse Opportunities" : "Sign Up as Candidate"} <ArrowRight size={16} />
              </button>
            </div>

            {/* Organization Hub Card */}
            <div className="hub-card org">
              <div className="hub-badge purple">
                <Building2 size={20} /> For Organizations & Companies
              </div>
              <h3>Discover Skilled, Deserving Talent</h3>
              <p className="hub-desc">
                Publish positions, attract qualified candidates with zero listing friction, and receive structured applicant resumes.
              </p>
              <ul className="hub-features">
                <li>
                  <Check size={18} color="#7c3aed" />
                  <span><strong>Effortless Job Publishing:</strong> Post full-time, part-time, internship, or remote positions in seconds.</span>
                </li>
                <li>
                  <Check size={18} color="#7c3aed" />
                  <span><strong>Resumes in Your Inbox:</strong> Applicant details and PDF resumes delivered straight to your official recruiter email.</span>
                </li>
                <li>
                  <Check size={18} color="#7c3aed" />
                  <span><strong>Recruitment Dashboard:</strong> Move candidates between Reviewing, Interviewing, and Hired stages.</span>
                </li>
                <li>
                  <Check size={18} color="#7c3aed" />
                  <span><strong>Official Verified Company:</strong> Build immediate credibility with the CareerVerse Verified Organization badge.</span>
                </li>
              </ul>
              <button
                className="hub-cta-btn purple"
                onClick={() => navigate(user ? (isOrg ? "/dashboard" : "/jobs") : "/signup?role=organization")}
              >
                {user ? (isOrg ? "Manage Openings" : "Explore Recruiter Portal") : "Register as Organization"} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. AI CAREER SUITE SHOWCASE                                   */}
      {/* ------------------------------------------------------------- */}
      <section id="ai-suite" className="landing-section">
        <div className="landing-section-container">
          <div className="section-head-center">
            <div className="section-eyebrow">Next-Generation Artificial Intelligence</div>
            <h2>Supercharge Your Career with Our AI Suite</h2>
            <p>Modern machine intelligence integrated to refine your credentials and build unstoppable interview confidence.</p>
          </div>

          <div className="ai-cards-grid">
            <div className="ai-card">
              <div className="ai-card-icon blue">
                <Bot size={28} />
              </div>
              <h3>AI Career Mentor</h3>
              <p>
                A personalized 24/7 advisor ready to review your career path, identify high-growth skill adjacencies, and provide step-by-step career roadmaps.
              </p>
              <div className="ai-card-footer">
                <span>Tailored career roadmaps</span>
                <button
                  type="button"
                  onClick={() => handleFeatureClick("/mentor")}
                  className="ai-card-link"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}
                >
                  Try Mentor ›
                </button>
              </div>
            </div>

            <div className="ai-card highlight">
              <div className="ai-card-icon purple">
                <FileText size={28} />
              </div>
              <h3>Resume Analyzer & ATS Optimizer</h3>
              <p>
                Analyze your resume against real industry benchmarks. Uncover missing technical keywords, improve formatting, and elevate your ATS pass rate.
              </p>
              <div className="ai-card-footer">
                <span>ATS compatibility scoring</span>
                <button
                  type="button"
                  onClick={() => handleFeatureClick("/resume")}
                  className="ai-card-link"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}
                >
                  Analyze Resume ›
                </button>
              </div>
            </div>

            <div className="ai-card">
              <div className="ai-card-icon emerald">
                <Mic size={28} />
              </div>
              <h3>AI Practice Interview Simulator</h3>
              <p>
                Practice technical and behavioral interview questions. Receive instant scoring on communication clarity, technical depth, and response structure.
              </p>
              <div className="ai-card-footer">
                <span>Voice & text simulation</span>
                <button
                  type="button"
                  onClick={() => handleFeatureClick("/practice-interview")}
                  className="ai-card-link"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}
                >
                  Start Practice ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. HOW IT WORKS (STEP-BY-STEP)                                */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="landing-section dark-subtle">
        <div className="landing-section-container">
          <div className="section-head-center">
            <div className="section-eyebrow">Clear & Transparent Process</div>
            <h2>How CareerVerse Works</h2>
            <p>A streamlined journey designed for speed, clarity, and genuine results.</p>

            <div className="journey-toggle-bar">
              <button
                type="button"
                className={`journey-toggle-btn ${activeJourneyTab === "candidate" ? "active" : ""}`}
                onClick={() => setActiveJourneyTab("candidate")}
              >
                <GraduationCap size={16} /> Candidate Journey
              </button>
              <button
                type="button"
                className={`journey-toggle-btn ${activeJourneyTab === "employer" ? "active" : ""}`}
                onClick={() => setActiveJourneyTab("employer")}
              >
                <Building2 size={16} /> Employer Workflow
              </button>
            </div>
          </div>

          {activeJourneyTab === "candidate" ? (
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-num">01</div>
                <h4>Build Your Profile</h4>
                <p>Register in seconds with email or Google. Upload your resume and showcase your education and skill portfolio.</p>
              </div>
              <div className="step-card">
                <div className="step-num">02</div>
                <h4>AI Prep & Polish</h4>
                <p>Run your resume through the ATS analyzer and practice questions using the AI interview simulator.</p>
              </div>
              <div className="step-card">
                <div className="step-num">03</div>
                <h4>Apply in One Click</h4>
                <p>Browse verified openings. When you click Apply, your resume is instantly packaged and sent to the hiring manager.</p>
              </div>
              <div className="step-card">
                <div className="step-num">04</div>
                <h4>Get Hired & Celebrate</h4>
                <p>Receive live status updates via email. When accepted, your achievement is honored in Hired from CareerVerse.</p>
              </div>
            </div>
          ) : (
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-num">01</div>
                <h4>Register Company Account</h4>
                <p>Create an organization profile with company name, industry, and logo for immediate candidate trust.</p>
              </div>
              <div className="step-card">
                <div className="step-num">02</div>
                <h4>Publish Job Listings</h4>
                <p>Specify position titles, locations, salaries, workplace styles (remote/hybrid/on-site), and skill requirements.</p>
              </div>
              <div className="step-card">
                <div className="step-num">03</div>
                <h4>Review Resumes in Real Time</h4>
                <p>Applications land directly in your recruiter dashboard and email inbox with candidate PDF resumes attached.</p>
              </div>
              <div className="step-card">
                <div className="step-num">04</div>
                <h4>Interview & Onboard</h4>
                <p>Update applicant statuses to notify candidates with one click and build your high-performing workforce.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. VISION STATEMENT SPOTLIGHT                                 */}
      {/* ------------------------------------------------------------- */}
      <section className="landing-vision-spotlight">
        <div className="landing-section-container">
          <div className="vision-spotlight-box">
            <div className="spotlight-tag">
              <Sparkles size={16} /> The CareerVerse Mission
            </div>
            <blockquote>
              "Our vision behind this project was to create a modern and accessible hiring platform that connects students with the right opportunities while helping organizations and companies find deserving candidates. We wanted the platform to have a simple, user-friendly interface while still offering the essential features expected from a modern hiring ecosystem.
              <br /><br />
              The modern touch of the platform reflects the changing generation and the rapid evolution of technology, especially with the integration of AI to make career exploration, hiring, and recruitment more efficient and personalized."
            </blockquote>
            <div className="spotlight-support-banner">
              <Mail size={18} color="#2563eb" />
              <span>
                Backed by <strong>100% Dedicated Online Email Support</strong> at <a href="mailto:careerverse999@gmail.com">careerverse999@gmail.com</a>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. DYNAMIC FAQS ACCORDION                                     */}
      {/* ------------------------------------------------------------- */}
      <section id="faqs" className="landing-section">
        <div className="landing-section-container">
          <div className="section-head-center">
            <div className="section-eyebrow">Frequently Asked Questions</div>
            <h2>Got Questions? We Have Answers.</h2>
            <p>Everything you need to know about joining, applying, and hiring on CareerVerse.</p>
          </div>

          <div className="landing-faq-list">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.id || idx} className={`landing-faq-item ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => toggleFaq(idx)}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {isOpen && (
                    <div className="faq-answer-pane">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. CALL TO ACTION BANNER                                      */}
      {/* ------------------------------------------------------------- */}
      <section className="landing-cta-strip">
        <div className="landing-section-container">
          <div className="cta-strip-card">
            <h2>Ready to Take the Next Step in Your Career?</h2>
            <p>
              Join thousands of students, engineers, and leading companies shaping their future on CareerVerse.
            </p>
            <div className="cta-strip-actions">
              {user ? (
                <button
                  className="cta-btn-white"
                  onClick={() => navigate(isOrg ? "/dashboard" : "/home")}
                >
                  {isOrg ? "Open Organization Dashboard" : "Return to Your Feed"} <ArrowRight size={16} />
                </button>
              ) : (
                <>
                  <button
                    className="cta-btn-white"
                    onClick={() => navigate("/signup")}
                  >
                    Get Started for Free <ArrowRight size={16} />
                  </button>
                  <button
                    className="cta-btn-outline"
                    onClick={() => navigate("/login")}
                  >
                    Log In to Account
                  </button>
                  <button
                    className="cta-btn-outline"
                    onClick={() => navigate("/contact")}
                  >
                    Contact Support Desk
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. GLOBAL FOOTER                                              */}
      {/* ------------------------------------------------------------- */}
      <Footer />
    </div>
  );
}

export default Welcome;
