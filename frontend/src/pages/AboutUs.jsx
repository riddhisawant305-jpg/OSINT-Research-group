import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Users,
  Briefcase,
  Bot,
  Award,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Mail,
  Heart,
  TrendingUp,
  GraduationCap,
  Building2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./AboutUs.css";

function AboutUs() {
  const { user } = useAuth();
  const isOrg = user && (user.role === "organization" || user.role === "recruiter");
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-badge">
          <Sparkles size={16} /> Our Mission & Vision
        </div>
        <h1>
          Bridging <span>Student Potential</span> with <span>Industry Opportunity</span>
        </h1>
        <p className="about-hero-sub">
          CareerVerse is a modern, accessible hiring and networking ecosystem built for the next generation of ambitious talent and forward-looking organizations.
        </p>
      </section>

      {/* Primary Vision Statement Card */}
      <section className="about-vision-card">
        <div className="vision-quote-tag">
          <Heart size={18} /> Official Platform Vision
        </div>
        <div className="vision-text-content">
          <p className="vision-lead">
            Our vision behind this project was to create a modern and accessible hiring platform that connects students with the right opportunities while helping organizations and companies find deserving candidates. We wanted the platform to have a simple, user-friendly interface while still offering the essential features expected from a modern hiring ecosystem.
          </p>
          <p>
            The modern touch of the platform reflects the changing generation and the rapid evolution of technology, especially with the integration of AI to make career exploration, hiring, and recruitment more efficient and personalized. At its core, our goal is to help students move one step closer to their dreams by making meaningful career opportunities more accessible and encouraging them to grow, learn, and get employed.
          </p>
          <p>
            For organizations and companies, our aim is equally important: to make it easier to discover capable, skilled, and deserving candidates who can genuinely contribute to their growth. Ultimately, we see this platform as a bridge between student potential and industry opportunity bringing the right people and the right opportunities together.
          </p>
        </div>
      </section>

      {/* Two Sides of CareerVerse */}
      <section className="about-two-sides">
        <div className="side-card student-side">
          <div className="side-header">
            <div className="side-icon-box blue">
              <GraduationCap size={26} />
            </div>
            <div>
              <h3>For Students & Candidates</h3>
              <p>Empowering ambitious job seekers and learners</p>
            </div>
          </div>
          <ul className="side-points">
            <li>
              <CheckCircle size={18} color="#2563eb" />
              <span><strong>Accessible Opportunities:</strong> Discover job and internship openings matched to your skills, with transparent application tracking.</span>
            </li>
            <li>
              <CheckCircle size={18} color="#2563eb" />
              <span><strong>AI-Powered Career Toolkit:</strong> Polish your resume with the Resume Analyzer, practice with the Mock Interview simulator, and consult the AI Career Mentor.</span>
            </li>
            <li>
              <CheckCircle size={18} color="#2563eb" />
              <span><strong>Professional Community:</strong> Share knowledge through feed posts, engage with mentors, and earn the CareerVerse Verified badge.</span>
            </li>
            <li>
              <CheckCircle size={18} color="#2563eb" />
              <span><strong>Real-time Email Updates:</strong> Receive instant status updates at every stage of your job application journey.</span>
            </li>
          </ul>
          <Link to="/jobs" className="side-btn blue">
            Explore Openings <ArrowRight size={16} />
          </Link>
        </div>

        <div className="side-card org-side">
          <div className="side-header">
            <div className="side-icon-box purple">
              <Building2 size={26} />
            </div>
            <div>
              <h3>For Organizations & Employers</h3>
              <p>Discovering skilled, deserving candidates</p>
            </div>
          </div>
          <ul className="side-points">
            <li>
              <CheckCircle size={18} color="#7c3aed" />
              <span><strong>Effortless Job Listings:</strong> Publish verified job postings with custom workplace types, salary ranges, and requirement specifications.</span>
            </li>
            <li>
              <CheckCircle size={18} color="#7c3aed" />
              <span><strong>Candidate Resumes Attached:</strong> Receive job applications directly via email with candidate details and applicant PDF resumes attached.</span>
            </li>
            <li>
              <CheckCircle size={18} color="#7c3aed" />
              <span><strong>Structured Recruitment:</strong> Seamlessly move applicants across Interviewing, Accepted, and Hired stages with automatic notifications.</span>
            </li>
            <li>
              <CheckCircle size={18} color="#7c3aed" />
              <span><strong>Trust & Integrity:</strong> Verified organization badges and transparent moderation protect companies and job seekers alike.</span>
            </li>
          </ul>
          {user ? (
            <Link to="/dashboard" className="side-btn purple">
              {isOrg ? "Manage Your Openings" : "View Employer Hub"} <ArrowRight size={16} />
            </Link>
          ) : (
            <Link to="/signup?role=organization" className="side-btn purple">
              Register as Organization <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </section>

      {/* Platform Pillars */}
      <section className="about-pillars">
        <div className="section-head">
          <h2>Core Principles of CareerVerse</h2>
          <p>The foundations driving every feature on our platform</p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-item">
            <div className="pillar-icon"><Bot size={24} /></div>
            <h4>AI-Powered Efficiency</h4>
            <p>Integrating modern generative AI to personalize career exploration, offer smart interview feedback, and optimize resumes.</p>
          </div>

          <div className="pillar-item">
            <div className="pillar-icon"><ShieldCheck size={24} /></div>
            <h4>Trust & Verification</h4>
            <p>Official CareerVerse Verified badges for both candidates and employers ensure authenticity, accountability, and security.</p>
          </div>

          <div className="pillar-item">
            <div className="pillar-icon"><Mail size={24} /></div>
            <h4>100% Dedicated Online Support</h4>
            <p>We provide total online email assistance, ensuring prompt, attentive, and documented support for every user inquiry.</p>
          </div>

          <div className="pillar-item">
            <div className="pillar-icon"><TrendingUp size={24} /></div>
            <h4>Empowering Growth</h4>
            <p>From university graduates to seasoned recruiters, our ecosystem is designed to foster continuous learning and meaningful employment.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta">
        <div className="cta-content">
          <h2>Ready to Take the Next Step in Your Career?</h2>
          <p>Join thousands of students and leading organizations on CareerVerse today.</p>
          <div className="cta-buttons">
            {user ? (
              <Link to={isOrg ? "/dashboard" : "/home"} className="cta-primary-btn">
                {isOrg ? "Go to Organization Dashboard" : "Go to Your Feed"} <ArrowRight size={16} />
              </Link>
            ) : (
              <Link to="/signup" className="cta-primary-btn">
                Get Started for Free <ArrowRight size={16} />
              </Link>
            )}
            <Link to="/contact" className="cta-secondary-btn">
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
