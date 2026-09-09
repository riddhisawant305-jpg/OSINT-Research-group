import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">CV</div>

          <h2>
            Career<span>Verse</span>
          </h2>
        </div>

        <div className="login-intro">
          <h1>Welcome Back 👋</h1>

          <p>
            Continue your professional journey, connect with
            people and discover new opportunities.
          </p>

          <div className="login-points">
            <div>✓ Build your professional network</div>
            <div>✓ Discover career opportunities</div>
            <div>✓ Get personalized career guidance</div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">

          <h1>Login</h1>

          <p className="login-subtitle">
            Sign in to your CareerVerse account
          </p>

          {error && (
            <div style={{ color: "#ef4444", background: "#fee2e2", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", marginBottom: "12px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="forgot-password">
              Forgot Password?
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <button type="button" className="google-btn">
            <span>G</span>
            Continue with Google
          </button>

          <p className="signup-link">
            Don't have an account?

            <span onClick={() => navigate("/signup")}>
              Create Account
            </span>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Login;
