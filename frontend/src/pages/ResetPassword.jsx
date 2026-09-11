import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import "./ResetPassword.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to reset password. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        <div className="reset-brand" onClick={() => navigate("/")}>
          <div className="reset-logo">CV</div>
          <h2>Career<span>Verse</span></h2>
        </div>

        {success ? (
          <div className="reset-success-box">
            <div className="reset-icon-wrap">
              <CheckCircle2 size={48} color="#16a34a" />
            </div>
            <h2>Password Reset Complete!</h2>
            <p>Your password has been successfully updated. You can now log into CareerVerse with your new credentials.</p>
            <button
              type="button"
              className="reset-btn"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <h1>Create New Password</h1>
            <p className="reset-subtitle">Enter your new secure password below to regain account access.</p>

            {error && <div className="reset-error-alert">{error}</div>}

            <form onSubmit={handleReset}>
              <label>New Password</label>
              <div className="password-input-wrap">
                <Lock size={18} color="#94a3b8" className="field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="toggle-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <label>Confirm New Password</label>
              <div className="password-input-wrap">
                <Lock size={18} color="#94a3b8" className="field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="reset-btn"
                disabled={loading}
              >
                {loading ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
