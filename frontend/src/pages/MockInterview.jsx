import React, { useState } from "react";
import { Mic, RefreshCw, CheckCircle2, ChevronRight } from "lucide-react";
import "./MockInterview.css";

const questions = [
  {
    q: "Tell me about yourself and your experience.",
    tip: "Structure it as: present role → past experience → why you're the right fit.",
  },
  {
    q: "Explain a challenging project you worked on.",
    tip: "Use the STAR method: Situation, Task, Action, Result.",
  },
  {
    q: "How do you stay updated with new technologies?",
    tip: "Mention blogs, communities, courses, and personal projects.",
  },
  {
    q: "Where do you see yourself in 5 years?",
    tip: "Align your ambition with the company's growth and your skill development.",
  },
];

function MockInterview() {
  const [step, setStep] = useState(0);
  const [recording, setRecording] = useState(false);
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  const current = questions[step];

  const start = () => {
    setStarted(true);
    setStep(0);
    setDone(false);
    setAnswers({});
  };

  const next = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    setStarted(false);
    setAnswers({});
    setDone(false);
  };

  if (!started) {
    return (
      <div className="interview-page">
        <h1 className="section-title">Mock Interview</h1>
        <div className="card interview-setup">
          <div className="setup-icon"><Mic size={36} /></div>
          <h2>Ready to practice?</h2>
          <p>
            Answer a few common interview questions to build confidence.
            Speak your answers or type them, then get tips to improve.
          </p>
          <ul className="setup-list">
            <li><CheckCircle2 size={16} /> {questions.length} practice questions</li>
            <li><CheckCircle2 size={16} /> Instant tips & feedback</li>
            <li><CheckCircle2 size={16} /> Tailored to your role</li>
          </ul>
          <button className="btn-primary setup-btn" onClick={start}>
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="interview-page">
        <h1 className="section-title">Mock Interview</h1>
        <div className="card interview-result">
          <div className="result-check"><CheckCircle2 size={48} /></div>
          <h2>Great job! 🎉</h2>
          <p>
            You completed the mock interview. Your responses show strong
            fundamentals. Keep practicing the STAR method to polish
            behavioral answers.
          </p>
          <div className="result-score">
            <div><strong>8.2</strong><span>Confidence</span></div>
            <div><strong>7.9</strong><span>Clarity</span></div>
            <div><strong>8.5</strong><span>Relevance</span></div>
          </div>
          <div className="result-actions">
            <button className="btn-outline" onClick={restart}><RefreshCw size={16} /> Try Again</button>
            <button className="btn-primary" onClick={restart}>New Session</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-page">
      <div className="interview-head">
        <h1 className="section-title">Mock Interview</h1>
        <span className="step-count">Question {step + 1} of {questions.length}</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: ((step + 1) / questions.length) * 100 + "%" }}
        ></div>
      </div>

      <div className="card interview-q-card">
        <span className="q-badge">Question {step + 1}</span>
        <h2>{current.q}</h2>
        <textarea
          className="answer-area"
          placeholder="Type your answer here..."
          rows={5}
          value={answers[step] || ""}
          onChange={(e) => setAnswers({ ...answers, [step]: e.target.value })}
        />
        <div className="interv-controls">
          <button
            className={recording ? "mic-btn recording" : "mic-btn"}
            onClick={() => setRecording(!recording)}
          >
            <Mic size={18} /> {recording ? "Stop Recording" : "Record Answer"}
          </button>
          <button className="btn-primary next-btn" onClick={next}>
            {step < questions.length - 1 ? "Next Question" : "Finish"} <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="card interview-tip">
        <strong>💡 Pro tip</strong>
        <p>{current.tip}</p>
      </div>
    </div>
  );
}

export default MockInterview;
