import React from "react";
import { useNavigate } from "react-router-dom";
import { Image, Video, Calendar, FileText, Bot, FileBadge, Mic, Map } from "lucide-react";
import { currentUser, posts } from "../data/dummyData";
import Avatar from "../component/Avatar";
import PostCard from "../component/PostCard";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const tools = [
    { to: "/mentor", Icon: Bot, label: "AI Career Mentor", color: "#7c3aed" },
    { to: "/resume", Icon: FileBadge, label: "Resume Analyzer", color: "#2563eb" },
    { to: "/interview", Icon: Mic, label: "Mock Interview", color: "#0891b2" },
    { to: "/roadmap", Icon: Map, label: "Learning Roadmap", color: "#d97706" },
  ];

  return (
    <div className="home-layout">
      <aside className="home-side left">
        <div className="card profile-mini" onClick={() => navigate("/profile")}>
          <div className="profile-mini-cover"></div>
          <Avatar user={currentUser} size={70} />
          <strong>{currentUser.name}</strong>
          <span>{currentUser.headline}</span>
          <div className="profile-mini-stats">
            <div><strong>{currentUser.connections}</strong><span>Connections</span></div>
            <div><strong>{currentUser.posts}</strong><span>Posts</span></div>
          </div>
        </div>
        <div className="card network-mini">
          <strong>Network</strong>
          <div className="network-row" onClick={() => navigate("/network")}>
            <span>Connections</span><span>{currentUser.connections}</span>
          </div>
          <div className="network-row" onClick={() => navigate("/network")}>
            <span>Follows</span><span>85</span>
          </div>
        </div>
      </aside>

      <section className="home-feed">
        <div className="card post-composer">
          <div className="composer-row">
            <Avatar user={currentUser} size={46} />
            <button className="composer-input" onClick={() => navigate("/create-post")}>
              Start a post, {currentUser.name.split(" ")[0]}?
            </button>
          </div>
          <div className="composer-actions">
            <button onClick={() => navigate("/create-post")}><Image size={18} /> Photo</button>
            <button onClick={() => navigate("/create-post")}><Video size={18} /> Video</button>
            <button onClick={() => navigate("/create-post")}><Calendar size={18} /> Event</button>
            <button onClick={() => navigate("/create-post")}><FileText size={18} /> Article</button>
          </div>
        </div>

        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </section>

      <aside className="home-side right">
        <div className="card tools-card">
          <h4>Career Tools</h4>
          {tools.map(({ to, Icon, label, color }) => (
            <button key={to} className="tool-row" onClick={() => navigate(to)}>
              <span className="tool-icon" style={{ background: color }}><Icon size={18} /></span>
              <span>{label}</span>
              <span className="tool-arrow">›</span>
            </button>
          ))}
        </div>
        <div className="card dashboard-mini" onClick={() => navigate("/dashboard")}>
          <strong>Career Dashboard</strong>
          <span>Track your progress and insights ›</span>
        </div>
      </aside>
    </div>
  );
}

export default Home;
