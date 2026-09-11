import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Signup.css";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "927361270744-t93si7t5g6ssuk134913hta9i8gvahgf.apps.googleusercontent.com";

function Signup() {
  const navigate = useNavigate();
  const { signup, googleLogin } = useAuth();
  const [accountType, setAccountType] = useState("candidate"); // 'candidate' | 'organization'
  const [form, setForm] = useState({
    name: "",
    headline: "",
    email: "",
    password: "",
    companyIndustry: "",
    companyWebsite: "",
    location: "",
    about: "",
    hrName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const update = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleGoogleSignupResponse = async (response) => {
    if (!response?.credential) return;
    setError("");
    setLoading(true);
    try {
      const selectedRole = accountType === "organization" ? "organization" : "student";
      const res = await googleLogin(response.credential, selectedRole);
      if (res.data?.role === "organization" || res.data?.role === "recruiter") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Google Sign-Up failed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId = null;

    const renderGoogleBtn = () => {
      if (window.google?.accounts?.id) {
        setGoogleLoaded(true);
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignupResponse,
        });

        const btnEl = document.getElementById("googleSignUpDiv");
        if (btnEl) {
          btnEl.innerHTML = "";
          window.google.accounts.id.renderButton(btnEl, {
            theme: "outline",
            size: "large",
            width: 320,
            text: "signup_with",
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
  }, [accountType]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: accountType === "organization" ? "organization" : "student",
        headline:
          form.headline ||
          (accountType === "organization"
            ? `${form.companyIndustry || "Technology"} Organization`
            : "Student / Professional"),
        location: form.location || "India",
        about: form.about || "",
        phone: form.phone || "",
      };

      if (accountType === "organization") {
        payload.companyName = form.name;
        payload.companyIndustry = form.companyIndustry;
        payload.companyWebsite = form.companyWebsite;
        payload.hrDetails = {
          name: form.hrName || form.name,
          email: form.email,
          phone: form.phone,
        };
        payload.organizationDetails = {
          name: form.name,
          website: form.companyWebsite,
          about: form.about,
          industry: form.companyIndustry,
        };
      }

      await signup(payload);
      if (accountType === "organization") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-brand" onClick={() => navigate("/")}>
          <div className="signup-logo">CV</div>
          <h1>
            Career<span>Verse</span>
          </h1>
        </div>

        <h2>Create your account</h2>
        <p className="signup-subtitle">
          Join thousands of professionals and hiring companies.
        </p>

        {/* Account Type Toggle */}
        <div className="signup-type-tabs">
          <button
            type="button"
            className={`signup-type-tab ${accountType === "candidate" ? "active" : ""}`}
            onClick={() => setAccountType("candidate")}
          >
            🎓 Candidate / Student
          </button>
          <button
            type="button"
            className={`signup-type-tab ${accountType === "organization" ? "active" : ""}`}
            onClick={() => setAccountType("organization")}
          >
            🏢 Organization / Company
          </button>
        </div>

        {error && (
          <div
            style={{
              color: "#ef4444",
              background: "#fee2e2",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "12px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          {accountType === "candidate" ? (
            <>
              <label>Full Name</label>
              <input
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={update}
                required
              />

              <label>Professional Headline</label>
              <input
                name="headline"
                placeholder="e.g. Frontend Developer | React Specialist"
                value={form.headline}
                onChange={update}
                required
              />

              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={update}
                required
              />

              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={update}
                minLength={6}
                required
              />
            </>
          ) : (
            <>
              <label>Company / Organization Name</label>
              <input
                name="name"
                placeholder="e.g. Acme Tech Solutions"
                value={form.name}
                onChange={update}
                required
              />

              <label>Industry / Sector</label>
              <input
                name="companyIndustry"
                placeholder="e.g. Software, Fintech, Healthcare, OSINT"
                value={form.companyIndustry}
                onChange={update}
                required
              />

              <label>Official Work Email</label>
              <input
                type="email"
                name="email"
                placeholder="e.g. hr@acmetech.com"
                value={form.email}
                onChange={update}
                required
              />

              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={update}
                minLength={6}
                required
              />

              <label>Company Website</label>
              <input
                type="url"
                name="companyWebsite"
                placeholder="https://company.com"
                value={form.companyWebsite}
                onChange={update}
              />

              <label>Location / Headquarters</label>
              <input
                name="location"
                placeholder="e.g. Bangalore, India (or Remote)"
                value={form.location}
                onChange={update}
              />

              <label>HR / Contact Person Name</label>
              <input
                name="hrName"
                placeholder="e.g. Jane Smith (Lead Recruiter)"
                value={form.hrName}
                onChange={update}
              />

              <label>HR Contact Phone</label>
              <input
                name="phone"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={update}
              />

              <label>About the Organization</label>
              <textarea
                name="about"
                placeholder="Brief overview of your company, mission, and culture..."
                value={form.about}
                onChange={update}
                rows={3}
              />
            </>
          )}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading
              ? "Creating Account..."
              : accountType === "organization"
              ? "Register Organization"
              : "Create Account"}
          </button>
        </form>

        <div className="signup-divider">
          <span>or</span>
        </div>

        <div
          id="googleSignUpDiv"
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
            className="signup-google"
            onClick={() => {
              if (window.google?.accounts?.id) {
                window.google.accounts.id.prompt();
              } else {
                setError("Google Services loading. Please try again in a moment.");
              }
            }}
          >
            <span>G</span> Continue with Google
          </button>
        )}

        <p className="signup-login">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
