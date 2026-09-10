import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ThumbsUp,
  Tag,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import "./ResumeAnalyzer.css";

const defaultSections = [
  { name: "Contact Information", score: 90, tip: "Looks great! Phone and email present.", status: "good" },
  { name: "Work Experience", score: 78, tip: "Add more quantifiable results (e.g. metrics, scale).", status: "warn" },
  { name: "Skills Relevance", score: 85, tip: "Strong keyword match for modern engineering positions.", status: "good" },
  { name: "Education", score: 88, tip: "Coursework and degree clearly formatted.", status: "good" },
  { name: "Keywords & ATS", score: 82, tip: "Standard section headings pass automated parser filters.", status: "good" },
  { name: "Formatting & Structure", score: 90, tip: "Clean and readable layout without complex tables.", status: "good" },
];

function ResumeAnalyzer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [score, setScore] = useState(82);
  const [sections, setSections] = useState(defaultSections);
  const [strengths, setStrengths] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Organizations should not use candidate resume analyzer
  useEffect(() => {
    if (user && (user.role === "organization" || user.role === "recruiter")) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const runAnalysis = async (fileObj, useSaved = false) => {
    setLoading(true);
    setErrorMessage("");
    try {
      let res;
      if (fileObj && fileObj instanceof File) {
        const formData = new FormData();
        formData.append("resume", fileObj);
        res = await API.post("/career/resume-analyzer", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (useSaved) {
        res = await API.post("/career/resume-analyzer", { useSavedResume: true });
      } else {
        const resumeText = text.trim() || (user ? `${user.name} - ${user.headline}. Skills: ${(user.skills || []).join(", ")}` : "Software Engineer with experience in React and Node.js.");
        res = await API.post("/career/resume-analyzer", { text: resumeText });
      }

      if (res.data && res.data.data) {
        const data = res.data.data;
        if (typeof data.score === "number") {
          setScore(data.score);
        }
        if (Array.isArray(data.sections) && data.sections.length > 0) {
          setSections(data.sections);
        }
        if (Array.isArray(data.strengths)) {
          setStrengths(data.strengths);
        }
        if (Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        }
        if (Array.isArray(data.missingSkills)) {
          setMissingSkills(data.missingSkills);
        }
      }
      setAnalyzed(true);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Resume analysis failed.";
      console.warn("Could not analyze resume:", errMsg);
      setErrorMessage(errMsg);
      // If it's a validation error (400), do NOT show dummy analyzed results
      if (err.response?.status === 400 || errMsg.toLowerCase().includes("resume")) {
        setAnalyzed(false);
      } else {
        // Fallback for general server network timeout
        setAnalyzed(true);
        setScore(80);
        setSections(defaultSections);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      runAnalysis(e.target.files[0], false);
    }
  };

  const reset = () => {
    setAnalyzed(false);
    setText("");
    setErrorMessage("");
    setScore(82);
    setSections(defaultSections);
    setStrengths([]);
    setSuggestions([]);
    setMissingSkills([]);
  };

  return (
    <div className="resume-page">
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(37, 99, 235, 0.08)",
            color: "#2563eb",
            fontSize: "0.82rem",
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: "9999px",
            marginBottom: 8,
          }}
        >
          <Sparkles size={15} /> Powered by CareerVerse Agentic ATS Model
        </span>
        <h1 className="section-title" style={{ marginBottom: 4 }}>AI Resume Analyzer</h1>
        <p className="resume-subtitle" style={{ margin: "0 auto" }}>
          Get instantaneous ATS compliance feedback and structured section scoring for your resume PDF.
        </p>
      </div>

      {errorMessage && (
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto 18px",
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            color: "#b91c1c",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {!analyzed ? (
        <div className="resume-upload-area card">
          <div className="upload-icon"><FileText size={40} /></div>
          <h3>Upload or Select Your Resume</h3>
          <p>The Agentic ATS will score your layout, action verbs, keyword density, and structural compliance.</p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, margin: "14px 0" }}>
            {user?.resume && (
              <button
                className="btn-primary"
                onClick={() => runAnalysis(null, true)}
                disabled={loading}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <FileText size={16} /> Analyze Saved Resume ({user.resumeFileName || "Saved_Resume.pdf"})
              </button>
            )}

            <label className="btn-outline upload-btn">
              <Upload size={16} /> Upload New Resume (PDF / TXT)
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <div className="or-divider"><span>or paste text below</span></div>
          <textarea
            className="resume-paste"
            placeholder="Paste your resume content or bullet points here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
          />
          <button
            className="btn-primary analyze-btn"
            onClick={() => runAnalysis()}
            disabled={loading}
          >
            {loading ? "Agentic ATS is Scoring..." : "Analyze Resume"}
          </button>
        </div>
      ) : (
        <div className="resume-results">
          <div className="card resume-score-card">
            <div className="score-ring" style={{ background: `conic-gradient(#2563eb ${score}%, #e5e7eb 0)` }}>
              <div className="score-inner"><strong>{score}</strong><span>/100</span></div>
            </div>
            <div>
              <h3>Overall ATS Score</h3>
              <p>
                <TrendingUp size={15} style={{ color: "var(--cv-green)", verticalAlign: "middle" }} />{" "}
                {score >= 80 ? "Excellent structure — ready to pass automated enterprise filters." : "Good baseline. Check the section tips below to optimize your score."}
              </p>
              <button className="btn-outline" onClick={reset}><RefreshCw size={15} /> Re-analyze</button>
            </div>
          </div>

          {/* Section Breakdowns */}
          <div className="resume-section-cards">
            {sections.map((s) => (
              <div key={s.name} className="card resume-row">
                <div className="resume-row-head">
                  {s.status === "good" ? (
                    <CheckCircle2 size={18} className="good" />
                  ) : s.status === "warn" ? (
                    <AlertCircle size={18} className="warn" />
                  ) : (
                    <AlertCircle size={18} className="bad" />
                  )}
                  <strong>{s.name}</strong>
                  <span>{s.score}%</span>
                </div>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: s.score + "%",
                      background: s.score >= 80 ? "var(--cv-green)" : s.score >= 65 ? "#d97706" : "#dc2626",
                    }}
                  ></div>
                </div>
                <p className="resume-tip">{s.tip}</p>
              </div>
            ))}
          </div>

          {/* Strengths & Missing Skills */}
          {(strengths.length > 0 || suggestions.length > 0 || missingSkills.length > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 16 }}>
              {strengths.length > 0 && (
                <div className="card" style={{ padding: 18 }}>
                  <h4 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.95rem", marginBottom: 10 }}>
                    <ThumbsUp size={16} color="#059669" /> Key Strengths
                  </h4>
                  <ul style={{ paddingLeft: 18, margin: 0, fontSize: "0.85rem", color: "#334155", lineHeight: 1.5 }}>
                    {strengths.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ul>
                </div>
              )}

              {suggestions.length > 0 && (
                <div className="card" style={{ padding: 18 }}>
                  <h4 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.95rem", marginBottom: 10 }}>
                    <Sparkles size={16} color="#2563eb" /> ATS Action Items
                  </h4>
                  <ul style={{ paddingLeft: 18, margin: 0, fontSize: "0.85rem", color: "#334155", lineHeight: 1.5 }}>
                    {suggestions.map((su, i) => (
                      <li key={i}>{su}</li>
                    ))}
                  </ul>
                </div>
              )}

              {missingSkills.length > 0 && (
                <div className="card" style={{ padding: 18 }}>
                  <h4 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.95rem", marginBottom: 10 }}>
                    <Tag size={16} color="#d97706" /> In-Demand Keywords to Consider
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {missingSkills.map((sk) => (
                      <span key={sk} style={{ background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 600 }}>
                        + {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
