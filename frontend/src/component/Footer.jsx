import React from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  Shield,
  Mail,
  Bot,
  FileText,
  Mic,
  Award,
  Heart,
  HelpCircle,
  Lock,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import "./Footer.css";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="cv-footer">
      <div className="cv-footer-container">
        {/* Top Grid */}
        <div className="cv-footer-grid">
          {/* Column 1: Brand & Mission */}
          <div className="cv-footer-col cv-footer-brand-col">
            <Link to="/home" className="cv-footer-logo" onClick={scrollToTop}>
              <div className="cv-footer-logo-badge">CV</div>
              <span className="cv-footer-logo-text">
                Career<span>Verse</span>
              </span>
            </Link>
            <p className="cv-footer-tagline">
              Bridging student potential with industry opportunity through modern, accessible hiring tools and AI-driven career exploration.
            </p>
            
            <div className="cv-footer-support-badge">
              <Mail size={16} className="cv-footer-support-icon" />
              <div>
                <span className="cv-footer-support-label">100% Online Email Support</span>
                <a href="mailto:careerverse999@gmail.com" className="cv-footer-support-email">
                  careerverse999@gmail.com
                </a>
              </div>
            </div>

            <div className="cv-footer-status-pill">
              <span className="cv-status-dot"></span>
              <span>All Systems Operational • Modern Hiring Platform</span>
            </div>
          </div>

          {/* Column 2: Platform & Opportunities */}
          <div className="cv-footer-col">
            <h4 className="cv-footer-heading">Platform & Jobs</h4>
            <ul className="cv-footer-links">
              <li>
                <Link to="/jobs" onClick={scrollToTop}>
                  <Briefcase size={14} /> Browse Job Openings
                </Link>
              </li>
              <li>
                <Link to="/home" onClick={scrollToTop}>
                  <Users size={14} /> Community Feed
                </Link>
              </li>
              <li>
                <Link to="/network" onClick={scrollToTop}>
                  <Users size={14} /> Professional Network
                </Link>
              </li>
              <li>
                <Link to="/dashboard" onClick={scrollToTop}>
                  <Briefcase size={14} /> Post Jobs (For Employers)
                </Link>
              </li>
              <li>
                <Link to="/hired" onClick={scrollToTop}>
                  <Award size={14} /> Hired Candidates
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: AI Career Ecosystem */}
          <div className="cv-footer-col">
            <h4 className="cv-footer-heading">AI Career Suite</h4>
            <ul className="cv-footer-links">
              <li>
                <Link to="/mentor" onClick={scrollToTop}>
                  <Bot size={14} /> AI Career Mentor
                </Link>
              </li>
              <li>
                <Link to="/resume" onClick={scrollToTop}>
                  <FileText size={14} /> Resume Analyzer & Optimizer
                </Link>
              </li>
              <li>
                <Link to="/practice-interview" onClick={scrollToTop}>
                  <Mic size={14} /> Mock Interview Simulator
                </Link>
              </li>
              <li>
                <span className="cv-footer-static-link">
                  <Sparkles size={14} /> Instant Application Tracking
                </span>
              </li>
              <li>
                <span className="cv-footer-static-link">
                  <CheckCircle2 size={14} /> Verified CareerVerse Badges
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Company & Trust */}
          <div className="cv-footer-col">
            <h4 className="cv-footer-heading">Company & Trust</h4>
            <ul className="cv-footer-links">
              <li>
                <Link to="/about" onClick={scrollToTop}>
                  <Heart size={14} /> About Us & Vision
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={scrollToTop}>
                  <HelpCircle size={14} /> Contact & Online Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" onClick={scrollToTop}>
                  <Lock size={14} /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" onClick={scrollToTop}>
                  <FileText size={14} /> Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="cv-footer-bottom">
          <div className="cv-footer-bottom-left">
            <p>© {new Date().getFullYear()} CareerVerse. Built for students, professionals & growing companies.</p>
          </div>

          <div className="cv-footer-bottom-right">
            <span className="cv-footer-security-tag">
              <Lock size={13} /> Secured via TLS & Google OAuth
            </span>
            <span className="cv-footer-divider-dot">•</span>
            <Link to="/about" onClick={scrollToTop}>About</Link>
            <span className="cv-footer-divider-dot">•</span>
            <Link to="/contact" onClick={scrollToTop}>Support</Link>
            <span className="cv-footer-divider-dot">•</span>
            <Link to="/privacy" onClick={scrollToTop}>Privacy</Link>
            <span className="cv-footer-divider-dot">•</span>
            <Link to="/terms" onClick={scrollToTop}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
