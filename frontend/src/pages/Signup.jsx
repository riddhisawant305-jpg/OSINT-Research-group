import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    headline: "",
    email: "",
    password: "",
  });

  const update = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = (e) => {
    e.preventDefault();
    navigate("/home");
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
          Join thousands of professionals building their careers.
        </p>

        <form onSubmit={handleSignup}>
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
            placeholder="e.g. Frontend Developer"
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

          <button type="submit" className="signup-btn">
            Create Account
          </button>
        </form>

        <div className="signup-divider">
          <span>or</span>
        </div>

        <button type="button" className="signup-google">
          <span>G</span> Continue with Google
        </button>

        <p className="signup-login">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
