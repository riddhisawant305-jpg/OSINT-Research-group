import React, { useState } from "react";
import { Bot, Send, Sparkles, ArrowRight } from "lucide-react";
import "./Mentor.css";

const suggestions = [
  "How should I prepare for frontend interviews?",
  "What skills should I learn next?",
  "How can I improve my resume?",
  "Which career path fits my skills?",
];

const canned = {
  interview:
    "Great question! For frontend interviews, focus on:\n\n1. JavaScript fundamentals (closures, promises, event loop)\n2. React concepts (hooks, rendering, state)\n3. CSS & layout skills\n4. 2-3 solid projects you can explain deeply\n\nPractice mock interviews and always explain your thought process out loud.",
  skills:
    "Based on your profile, you're strong in React and JavaScript. To stand out next, consider:\n\n• TypeScript (huge demand)\n• Testing (Jest, Vitest)\n• Next.js / full-stack basics\n• System design fundamentals\n\nPick ONE and go deep over the next 4 weeks.",
  resume:
    "Here are 3 quick wins for your resume:\n\n1. Quantify results (e.g. 'improved load time by 40%')\n2. Tailor keywords to each job description\n3. Put impact, not just responsibilities\n\nI can help you refine specific bullets!",
  career:
    "Your profile leans toward frontend/product engineering. Given your interest in AI tools, a great path is:\n\n• Frontend Engineer → Senior → Staff\n• Or pivot to AI Engineering (build tools like this one!)\n\nBoth are excellent — it depends on whether you love craft (frontend) or problem modeling (AI).",
};

const defaultReply =
  "That's a thoughtful question. Based on your CareerVerse profile, I'd recommend focusing on building a strong portfolio of projects, practicing mock interviews, and networking with professionals in your target role. What specific area would you like to dive into?";

function Mentor() {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi Darshan! I'm your AI Career Mentor. 🤖 Ask me anything about your career, skills, interviews, or resume.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const respond = (q) => {
    const lower = q.toLowerCase();
    let reply = defaultReply;
    if (lower.includes("interview")) reply = canned.interview;
    else if (lower.includes("skill")) reply = canned.skills;
    else if (lower.includes("resume")) reply = canned.resume;
    else if (lower.includes("career") || lower.includes("path")) reply = canned.career;
    return reply;
  };

  const send = (text) => {
    const q = (text || input).trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { from: "me", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: respond(q) }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className="mentor-page">
      <div className="mentor-head">
        <div className="mentor-avatar"><Bot size={26} /></div>
        <div>
          <h1 className="section-title" style={{ marginBottom: 0 }}>AI Career Mentor</h1>
          <p className="mentor-status"><span className="status-dot"></span> Online · Ask me anything</p>
        </div>
      </div>

      <div className="mentor-suggestions">
        {suggestions.map((s) => (
          <button key={s} onClick={() => send(s)}>
            {s} <ArrowRight size={14} />
          </button>
        ))}
      </div>

      <div className="mentor-chat card">
        <div className="mentor-messages">
          {messages.map((m, i) => (
            <div key={i} className={"mentor-msg " + m.from}>
              {m.from === "bot" && <div className="mini-avatar"><Bot size={16} /></div>}
              <div className="mentor-bubble">{m.text}</div>
            </div>
          ))}
          {typing && (
            <div className="mentor-msg bot">
              <div className="mini-avatar"><Bot size={16} /></div>
              <div className="mentor-bubble typing-dots"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>

        <form
          className="mentor-input"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            placeholder="Ask about careers, skills, interviews..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-primary" aria-label="Send"><Send size={18} /></button>
        </form>
      </div>

      <div className="mentor-note">
        <Sparkles size={14} /> Powered by CareerVerse AI · Responses are simulated for demo.
      </div>
    </div>
  );
}

export default Mentor;
