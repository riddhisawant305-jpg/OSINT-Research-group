import React, { useState } from "react";
import { FileText, Upload, RefreshCw, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import "./ResumeAnalyzer.css";

const sections = [
  { name: "Contact Information", score: 90, tip: "Looks great!", status: "good" },
  { name: "Work Experience", score: 72, tip: "Add more quantifiable results (e.g. numbers, impact).", status: "warn" },
  { name: "Skills Relevance", score: 80, tip: "Good match — add TypeScript to boost relevance.", status: "good" },
  { name: "Education", score: 85, tip: "Solid. Consider adding coursework or achievements.", status: "good" },
  { name: "Keywords & ATS", score: 58, tip: "Add keywords matching job descriptions to pass ATS filters.", status: "bad" },
  { name: "Formatting", score: 88, tip: "Clean and readable. Keep it to one page if possible.", status: "good" },
];

function ResumeAnalyzer() {
  const [text, setText] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [score, setScore] = useState(78);

  const runAnalysis = () => {
    setAnalyzed(true);
    setScore(78);
  };

  const reset = () => {
    setAnalyzed(false);
    setText("");
  };

  return (
    <div className="resume-page">
      <h1 className="section-title">Resume Analyzer</h1>
      <p className="resume-subtitle">
        Get instant feedback and an ATS score for your resume.
      </p>

      {!analyzed ? (
        <div className="resume-upload-area card">
          <div className="upload-icon"><FileText size={40} /></div>
          <h3>Upload or paste your resume</h3>
          <p>We'll analyze structure, keywords, and formatting.</p>
          <label className="btn-outline upload-btn">
            <Upload size={16} /> Upload PDF / DOCX
            <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={runAnalysis} />
          </label>
          <div className="or-divider"><span>or paste the text below</span></div>
          <textarea
            className="resume-paste"
            placeholder="Paste your resume content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
          />
          <button className="btn-primary analyze-btn" onClick={runAnalysis}>
            Analyze Resume
          </button>
        </div>
      ) : (
        <div className="resume-results">
          <div className="card resume-score-card">
            <div className="score-ring" style={{ background: `conic-gradient(#2563eb ${score}%, #e5e7eb 0)` }}>
              <div className="score-inner"><strong>{score}</strong><span>/100</span></div>
            </div>
            <div>
              <h3>Overall Score</h3>
              <p><TrendingUp size={15} style={{ color: "var(--cv-green)" }} /> On par with top applicants in your field.</p>
              <button className="btn-outline" onClick={reset}><RefreshCw size={15} /> Re-analyze</button>
            </div>
          </div>

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
                <div className="bar"><div className="bar-fill" style={{ width: s.score + "%", background: s.score >= 80 ? "var(--cv-green)" : s.score >= 65 ? "#d97706" : "#dc2626" }}></div></div>
                <p className="resume-tip">{s.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
