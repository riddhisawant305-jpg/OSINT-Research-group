import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "927361270744-t93si7t5g6ssuk134913hta9i8gvahgf.apps.googleusercontent.com";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const fromLocation = location.state?.from?.pathname;

  useEffect(() => {
    let intervalId = null;

    const renderGoogleBtn = () => {
      if (window.google?.accounts?.id) {
        setGoogleLoaded(true);
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });

        const btnEl = document.getElementById("googleSignInDiv");
        if (btnEl) {
          btnEl.innerHTML = "";
          window.google.accounts.id.renderButton(btnEl, {
            theme: "outline",
            size: "large",
            width: 320,
            text: "continue_with",
            shape: "rectangular",
          });
        }
        return true;
      }
      return false;
    };

    if (!renderGoogleBtn()) {
      intervalId = setInterval(() => {
        if (renderGoogleBtn() && intervalId) {
          clearInterval(intervalId);
        }
      }, 200);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    if (!response?.credential) return;
    setError("");
    setLoading(true);
    try {
      const res = await googleLogin(response.credential, "student");
      const isOrg = res.data?.role === "organization" || res.data?.role === "recruiter";
      const target = fromLocation || (isOrg ? "/dashboard" : "/home");
      navigate(target, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Google Sign-In failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      const isOrg = res.data?.role === "organization" || res.data?.role === "recruiter";
      const target = fromLocation || (isOrg ? "/dashboard" : "/home");
      navigate(target, { replace: true });
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

            <div
              className="forgot-password"
              onClick={() => navigate("/forgot-password")}
              style={{ cursor: "pointer" }}
            >
              Forgot Password?
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <div
            id="googleSignInDiv"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              minHeight: "44px",
              marginBottom: "6px",
            }}
          ></div>

          {!googleLoaded && (
            <button
              type="button"
              className="google-btn"
              onClick={() => {
                if (window.google?.accounts?.id) {
                  window.google.accounts.id.prompt();
                } else {
                  setError("Google Services loading. Please try again in a moment.");
                }
              }}
            >
              <span>G</span>
              Continue with Google
            </button>
          )}

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
