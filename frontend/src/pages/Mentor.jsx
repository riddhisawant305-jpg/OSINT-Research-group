import React, { useState } from "react";
import { Bot, Send, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import "./Mentor.css";

const suggestions = [
  "How should I prepare for frontend interviews?",
  "What skills should I learn next?",
  "How can I improve my resume?",
  "Which career path fits my skills?",
];

const cannedFallback = {
  interview:
    "Great question! For interviews, focus on:\n\n1. Core fundamentals (closures, promises, event loop)\n2. Architecture & design patterns (hooks, rendering, state)\n3. Testing & clean code\n4. 2-3 solid projects you can explain deeply\n\nPractice mock interviews and always explain your thought process out loud.",
  skills:
    "Based on current market trends, consider focusing on:\n\n• TypeScript & Next.js\n• Testing (Vitest, Jest)\n• Cloud fundamentals (Docker, CI/CD)\n• System design basics\n\nPick one key area and build a project with it.",
  resume:
    "Here are 3 quick wins for your resume:\n\n1. Quantify results (e.g. 'improved load time by 40%')\n2. Tailor keywords to each job description\n3. Put impact, not just responsibilities\n\nMake sure your GitHub and deployed links are clearly visible!",
  career:
    "A strong engineering career path combines depth in your primary stack with breadth in system architecture and team collaboration. Keep shipping projects and documenting your learnings.",
};

function Mentor() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: `Hi ${firstName}! I'm your AI Career Mentor. 🤖 Ask me anything about your career, skills, interviews, or resume.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const fallbackReply = (q) => {
    const lower = q.toLowerCase();
    if (lower.includes("interview")) return cannedFallback.interview;
    if (lower.includes("skill")) return cannedFallback.skills;
    if (lower.includes("resume")) return cannedFallback.resume;
    if (lower.includes("career") || lower.includes("path")) return cannedFallback.career;
    return "Based on your CareerVerse profile, focus on building high-impact projects, mastering core software fundamentals, and tailoring your experience with quantifiable achievements.";
  };

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || typing) return;

    setMessages((m) => [...m, { from: "me", text: q }]);
    setInput("");
    setTyping(true);

    try {
      const res = await API.post("/career/mentor", {
        message: q,
        context: {
          name: user?.name,
          headline: user?.headline,
          skills: user?.skills,
          education: user?.education,
          experience: user?.experience,
        },
      });

      if (res.data && res.data.data && res.data.data.reply) {
        setMessages((m) => [...m, { from: "bot", text: res.data.data.reply }]);
      } else {
        setMessages((m) => [...m, { from: "bot", text: fallbackReply(q) }]);
      }
    } catch (err) {
      // If Gemini key is not configured, show helpful notice while providing guidance
      const serverMsg = err.response?.data?.message;
      if (serverMsg && serverMsg.includes("GEMINI_API_KEY")) {
        setMessages((m) => [
          ...m,
          {
            from: "bot",
            text: `(Notice: GEMINI_API_KEY is not configured in backend/.env yet.)\n\n${fallbackReply(q)}`,
          },
        ]);
      } else {
        setMessages((m) => [...m, { from: "bot", text: fallbackReply(q) }]);
      }
    } finally {
      setTyping(false);
    }
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
        <Sparkles size={14} /> Powered by CareerVerse AI & Google Gemini
      </div>
    </div>
  );
}

export default Mentor;
