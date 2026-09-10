import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
  HelpCircle,
  BarChart3,
  ThumbsUp,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import "./PracticeInterview.css";

function PracticeInterview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Organizations should not use candidate mock interview practice
  useEffect(() => {
    if (user && (user.role === "organization" || user.role === "recruiter")) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);
  const [started, setStarted] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  // Load questions from Agentic AI backend
  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/career/practice-interview/generate", {});
      if (res.data && res.data.data && res.data.data.questions) {
        setQuestions(res.data.data.questions);
      } else {
        throw new Error("No questions returned");
      }
    } catch (err) {
      console.warn("Could not generate questions dynamically, using agent baseline:", err.message);
      // Fallback 8 questions
      setQuestions([
        {
          id: 1,
          category: "Introduction & Elevator Pitch",
          question: "Walk me through your professional background. What are your core strengths and technical interests?",
          tip: "Structure as: Current focus → Key accomplishments → Career motivation."
        },
        {
          id: 2,
          category: "Technical Fundamentals",
          question: "Explain a complex engineering or coding challenge you resolved recently and the rationale behind your approach.",
          tip: "Highlight problem discovery, architectural trade-offs, and final impact."
        },
        {
          id: 3,
          category: "Debugging & Problem Solving",
          question: "Describe your systematic process when tracking down a tricky production issue or memory leak.",
          tip: "Mention telemetry, reproducible test cases, logs, and root-cause analysis."
        },
        {
          id: 4,
          category: "System Design & Scalability",
          question: "How do you design APIs and databases for high concurrency, caching, and data consistency?",
          tip: "Discuss REST/GraphQL patterns, connection pooling, Redis, and indexing."
        },
        {
          id: 5,
          category: "Behavioral & STAR Method",
          question: "Tell me about a time you handled ambiguous project requirements or tight deadlines.",
          tip: "Use the STAR method: Situation, Task, Action, and measurable Result."
        },
        {
          id: 6,
          category: "Collaboration & Code Reviews",
          question: "How do you provide constructive code reviews and manage differing architectural opinions?",
          tip: "Emphasize empathy, objective coding standards, and collaborative consensus."
        },
        {
          id: 7,
          category: "Security & Quality Standards",
          question: "What essential security practices do you enforce before pushing features to production?",
          tip: "Mention input validation, auth token security, least privilege, and automated tests."
        },
        {
          id: 8,
          category: "Career Vision & Growth",
          question: "What technical skills are you actively mastering right now and why?",
          tip: "Show passion for learning, personal projects, and business impact."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleStart = () => {
    setStarted(true);
    setStep(0);
    setAnswers({});
    setCurrentAnswer("");
    setReport(null);
  };

  const handleNext = () => {
    const qId = questions[step]?.id || step + 1;
    const updatedAnswers = { ...answers, [qId]: currentAnswer };
    setAnswers(updatedAnswers);

    if (step < questions.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      const nextQId = questions[nextStep]?.id || nextStep + 1;
      setCurrentAnswer(updatedAnswers[nextQId] || "");
    } else {
      // Finished all questions, evaluate
      handleEvaluate(updatedAnswers);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      const qId = questions[step]?.id || step + 1;
      const updatedAnswers = { ...answers, [qId]: currentAnswer };
      setAnswers(updatedAnswers);

      const prevStep = step - 1;
      setStep(prevStep);
      const prevQId = questions[prevStep]?.id || prevStep + 1;
      setCurrentAnswer(updatedAnswers[prevQId] || "");
    }
  };

  const handleEvaluate = async (finalAnswers) => {
    setEvaluating(true);
    try {
      const res = await API.post("/career/practice-interview/evaluate", {
        answers: finalAnswers,
      });
      if (res.data && res.data.data) {
        setReport(res.data.data);
      }
    } catch (err) {
      console.warn("Evaluation error, calculating local score:", err.message);
      const ansValues = Object.values(finalAnswers || {});
      const answered = ansValues.filter((a) => a && a.trim().length > 0);
      const isBlank = answered.length === 0;
      const score = isBlank ? 0 : Number(((answered.length / Math.max(questions.length, 1)) * 6.5).toFixed(1));

      setReport({
        overallScore: score,
        ratingScale: "Out of 10",
        confidence: isBlank ? 0 : Number((score + 0.3).toFixed(1)),
        eligibility: isBlank ? 0 : score,
        communication: isBlank ? 0 : Math.max(score - 0.2, 1.0),
        problemSolving: isBlank ? 0 : Number((score + 0.2).toFixed(1)),
        summary: isBlank
          ? "No answers were submitted. Practice interviews require thorough, structured answers to assess your technical readiness."
          : "Interview session evaluated locally based on submission completeness.",
        strengths: isBlank ? [
          "Familiarized yourself with the practice interview flow"
        ] : [
          "Attempted core engineering interview questions",
          "Demonstrated interest in interview preparation"
        ],
        recommendations: [
          "Provide detailed, structured responses for each question to earn an accurate score",
          "Apply the STAR framework and cite specific technologies and metrics"
        ],
        questionFeedback: questions.map((q, idx) => {
          const ans = (finalAnswers || {})[q.id || idx + 1] || "";
          const hasAns = ans && ans.trim().length > 0;
          return {
            questionId: q.id || idx + 1,
            score: hasAns ? 6.5 : 0.0,
            status: hasAns ? "Attempted" : "Unanswered",
            feedback: hasAns ? "Answer submitted." : "No answer provided. In a live interview, blank answers disqualify candidates."
          };
        })
      });
    } finally {
      setEvaluating(false);
    }
  };

  const currentQ = questions[step] || {};

  // Setup View
  if (!started) {
    return (
      <div className="practice-interview-page">
        <div className="practice-head">
          <div className="practice-badge">
            <Sparkles size={16} /> Powered by CareerVerse Agentic AI
          </div>
          <h1>Practice Interview</h1>
          <p className="practice-subtitle">
            Practice realistic interview questions tailored to your profile and resume.
            Get evaluated on confidence, technical eligibility, and clarity — rated out of 10.
          </p>
        </div>

        <div className="card practice-setup-card">
          <div className="setup-icon-box">
            <Mic size={40} color="#0891b2" />
          </div>
          <h2>Ready to Test Your Interview Readiness?</h2>
          <p>
            The Agentic Interview Coach will ask you {questions.length || 8} targeted questions across
            technical fundamentals, system architecture, and behavioral leadership.
          </p>

          <div className="setup-features-grid">
            <div className="feature-pill">
              <CheckCircle2 size={16} color="#0891b2" />
              <span>{questions.length || 8} Tailored Questions</span>
            </div>
            <div className="feature-pill">
              <CheckCircle2 size={16} color="#0891b2" />
              <span>Instant Recruiter Tips</span>
            </div>
            <div className="feature-pill">
              <CheckCircle2 size={16} color="#0891b2" />
              <span>Comprehensive Rating (Out of 10)</span>
            </div>
            <div className="feature-pill">
              <CheckCircle2 size={16} color="#0891b2" />
              <span>Confidence & Eligibility Breakdown</span>
            </div>
          </div>

          <div className="candidate-context-banner">
            <FileText size={16} color="#0891b2" />
            <span>
              Practicing as: <strong>{user?.name || "Candidate"}</strong> ·{" "}
              {user?.headline || "Software Engineer"}
            </span>
          </div>

          <button
            className="btn-primary setup-start-btn"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? "Preparing Questions..." : "Start Practice Interview"}
          </button>
        </div>
      </div>
    );
  }

  // Evaluating Screen
  if (evaluating) {
    return (
      <div className="practice-interview-page">
        <div className="card practice-loading-card">
          <div className="spinner-ring"></div>
          <h2>Agentic AI is Evaluating Your Responses...</h2>
          <p>Scoring confidence, technical eligibility, communication clarity, and problem solving...</p>
        </div>
      </div>
    );
  }

  // Report View (Rated out of 10)
  if (report) {
    return (
      <div className="practice-interview-page">
        <div className="practice-head">
          <div className="practice-badge success">
            <Award size={16} /> Evaluation Complete
          </div>
          <h1>Practice Interview Report</h1>
          <p className="practice-subtitle">
            Here is your overall performance report evaluated by the CareerVerse Agentic AI Model.
          </p>
        </div>

        <div className="card practice-report-hero">
          <div className="overall-score-circle">
            <span className="big-num">{report.overallScore}</span>
            <span className="out-of">/ 10</span>
          </div>
          <div className="report-summary-text">
            <h2>Overall Score: {report.overallScore} / 10</h2>
            <p className="report-lead">{report.summary}</p>
          </div>
        </div>

        {/* Breakdown metrics out of 10 */}
        <div className="practice-metrics-grid">
          <div className="card metric-box">
            <span className="metric-label">Confidence</span>
            <strong className="metric-val">{report.confidence || report.overallScore} / 10</strong>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${Math.min((report.confidence || report.overallScore) * 10, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="card metric-box">
            <span className="metric-label">Technical Eligibility</span>
            <strong className="metric-val">{report.eligibility || report.overallScore} / 10</strong>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${Math.min((report.eligibility || report.overallScore) * 10, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="card metric-box">
            <span className="metric-label">Communication Clarity</span>
            <strong className="metric-val">{report.communication || report.overallScore} / 10</strong>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${Math.min((report.communication || report.overallScore) * 10, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="card metric-box">
            <span className="metric-label">Problem Solving</span>
            <strong className="metric-val">{report.problemSolving || report.overallScore} / 10</strong>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${Math.min((report.problemSolving || report.overallScore) * 10, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Strengths & Recommendations */}
        <div className="practice-details-grid">
          <div className="card report-section-card">
            <h3><ThumbsUp size={18} color="#059669" /> Key Strengths</h3>
            <ul className="report-bullets">
              {(report.strengths || []).map((str, idx) => (
                <li key={idx}>✓ {str}</li>
              ))}
            </ul>
          </div>

          <div className="card report-section-card">
            <h3><AlertCircle size={18} color="#d97706" /> Areas to Polish</h3>
            <ul className="report-bullets">
              {(report.recommendations || []).map((rec, idx) => (
                <li key={idx}>💡 {rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Question by Question Feedback */}
        {Array.isArray(report.questionFeedback) && report.questionFeedback.length > 0 && (
          <div className="card report-section-card" style={{ marginTop: "1.25rem" }}>
            <h3><BarChart3 size={18} color="#0891b2" /> Question-by-Question Evaluation</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
              {report.questionFeedback.map((qf, idx) => (
                <div key={idx} style={{ padding: "0.75rem 1rem", borderRadius: "8px", background: "var(--bg-card, #f8fafc)", border: "1px solid var(--border-color, #e2e8f0)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Question {qf.questionId || idx + 1}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: qf.score >= 7.0 ? "#059669" : qf.score >= 4.0 ? "#d97706" : "#dc2626" }}>
                      {qf.score} / 10 · {qf.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary, #64748b)" }}>{qf.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="report-actions-row">
          <button className="btn-outline" onClick={handleStart}>
            <RefreshCw size={16} /> Practice Another Round
          </button>
          <button className="btn-primary" onClick={() => window.location.href = "/jobs"}>
            Explore Relevant Jobs
          </button>
        </div>
      </div>
    );
  }

  // Answering View (Step by Step)
  const progressPercent = Math.round(((step + 1) / questions.length) * 100);

  return (
    <div className="practice-interview-page">
      <div className="practice-progress-bar-wrap">
        <div className="progress-meta">
          <span>Question {step + 1} of {questions.length}</span>
          <span>{progressPercent}% Completed</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="card practice-question-card">
        <div className="question-cat-pill">
          {currentQ.category || "General Interview"}
        </div>
        <h2 className="question-text">{currentQ.question}</h2>

        {currentQ.tip && (
          <div className="question-tip-banner">
            <HelpCircle size={16} color="#0891b2" />
            <div>
              <strong>Coach Tip: </strong>
              <span>{currentQ.tip}</span>
            </div>
          </div>
        )}

        <div className="answer-input-area">
          <label htmlFor="ans-area">Your Response:</label>
          <textarea
            id="ans-area"
            rows={6}
            placeholder="Type your structured answer here. Speak to past experiences, methodologies, and outcomes..."
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
          />
          <div className="answer-meta-footer">
            <span>Word count: {currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0} words</span>
            <span className="hint-text">Aim for 30-80 words with specific technical examples</span>
          </div>
        </div>

        <div className="question-nav-actions">
          <button
            className="btn-outline"
            onClick={handlePrev}
            disabled={step === 0}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <button
            className="btn-primary next-step-btn"
            onClick={handleNext}
          >
            {step < questions.length - 1 ? (
              <>Next Question <ChevronRight size={16} /></>
            ) : (
              <>Finish & View Report <Award size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PracticeInterview;
