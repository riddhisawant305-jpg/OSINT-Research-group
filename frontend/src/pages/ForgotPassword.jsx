import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <div className="forgot-brand" onClick={() => navigate("/")}>
          <div className="forgot-logo">CV</div>
          <h2>Career<span>Verse</span></h2>
        </div>

        {sent ? (
          <div className="forgot-success">
            <div className="success-icon-box">
              <CheckCircle2 size={44} color="#16a34a" />
            </div>
            <h2>Check your inbox!</h2>
            <p>
              We've dispatched a password reset link to:
              <br />
              <strong>{email}</strong>
            </p>
            <div className="reset-instruction-box">
              Click the link in that email to create a new password. The link will remain valid for 1 hour.
            </div>
            <button
              type="button"
              className="forgot-submit-btn"
              onClick={() => navigate("/login")}
            >
              Return to Login
            </button>
          </div>
        ) : (
          <>
            <h1>Reset your password</h1>
            <p className="forgot-subtitle">
              Enter your registered candidate or organization email address and we'll send you a password reset link.
            </p>

            {error && (
              <div className="forgot-error-alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label>Registered Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} color="#94a3b8" className="field-icon" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="forgot-submit-btn"
                disabled={loading}
              >
                {loading ? "Sending Reset Link..." : "Send Password Reset Link"}
              </button>
            </form>

            <div className="forgot-back-link" onClick={() => navigate("/login")}>
              <ArrowLeft size={16} /> Back to Login
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
