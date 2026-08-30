import React from "react";
import { useNavigate } from "react-router-dom";
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
          © 2026 CareerVerse · Connect. Grow. Succeed.
        </div>

      </div>
    </div>
  );
}

export default Welcome;