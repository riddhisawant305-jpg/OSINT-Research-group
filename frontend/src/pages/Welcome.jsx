import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Welcome.css";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <div className="welcome-container">

        <div className="welcome-logo">
          <div className="logo-icon">CV</div>
          <h2>Career<span>Verse</span></h2>
        </div>

        <div className="welcome-content">
          <div className="welcome-badge">
            🚀 Your Career. Your Network. Your Future.
          </div>

          <h1>
            Build Your <span>Professional Future</span>
          </h1>

          <p>
            Connect with professionals, discover exciting job opportunities,
            improve your skills and take your career to the next level.
          </p>

          <div className="welcome-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/login")}
            >
              Get Started <span>→</span>
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/signup")}
            >
              Create Account
            </button>
          </div>

          <div className="welcome-features">
            <div>
              <strong>10K+</strong>
              <span>Professionals</span>
            </div>

            <div>
              <strong>5K+</strong>
              <span>Job Opportunities</span>
            </div>

            <div>
              <strong>1K+</strong>
              <span>Companies</span>
            </div>
          </div>
        </div>

        <div className="welcome-footer">
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", marginBottom: "8px", flexWrap: "wrap", fontSize: "13px" }}>
            <Link to="/about" style={{ color: "#94a3b8", textDecoration: "none" }}>About Us</Link>
            <span>·</span>
            <Link to="/contact" style={{ color: "#94a3b8", textDecoration: "none" }}>Contact & Support</Link>
            <span>·</span>
            <Link to="/privacy" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms of Service</Link>
          </div>
          © 2026 CareerVerse · Connect. Grow. Succeed.
        </div>

      </div>
    </div>
  );
}

export default Welcome;