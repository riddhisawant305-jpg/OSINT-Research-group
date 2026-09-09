import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Video, Calendar, FileText, Bot, FileBadge, Mic, Map } from "lucide-react";
import { currentUser as fallbackUser, posts as fallbackPosts } from "../data/dummyData";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import Avatar from "../component/Avatar";
import PostCard from "../component/PostCard";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeUser = user || fallbackUser;

  const [feedPosts, setFeedPosts] = useState(fallbackPosts);
  const [stats, setStats] = useState({
    connections: activeUser.connections || 0,
    posts: activeUser.posts || 0,
  });

  useEffect(() => {
    // Fetch live feed posts from backend
    const fetchPosts = async () => {
      try {
        const res = await API.get("/posts");
        if (res.data && res.data.data && res.data.data.length > 0) {
          setFeedPosts(res.data.data);
        }
      } catch (err) {
        console.warn("Could not fetch posts from backend:", err.message);
      }
    };

    // Fetch live user stats
    const fetchStats = async () => {
      try {
        const res = await API.get("/users/me/dashboard");
        if (res.data && res.data.data && res.data.data.careerStats) {
          setStats({
            connections: res.data.data.careerStats.connectionsCount,
            posts: res.data.data.careerStats.postsCount,
          });
        }
      } catch (err) {
        // Fallback to activeUser properties if unauthenticated
      }
    };

    fetchPosts();
    fetchStats();
  }, []);

  const tools = [
    { to: "/mentor", Icon: Bot, label: "AI Career Mentor", color: "#7c3aed" },
    { to: "/resume", Icon: FileBadge, label: "Resume Analyzer", color: "#2563eb" },
    { to: "/interview", Icon: Mic, label: "Mock Interview", color: "#0891b2" },
    { to: "/roadmap", Icon: Map, label: "Learning Roadmap", color: "#d97706" },
  ];

  const firstName = activeUser.name ? activeUser.name.split(" ")[0] : "Friend";

  return (
    <div className="home-layout">
      <aside className="home-side left">
        <div className="card profile-mini" onClick={() => navigate("/profile")}>
          <div className="profile-mini-cover"></div>
          <Avatar user={activeUser} size={70} />
          <strong>{activeUser.name}</strong>
          <span>{activeUser.headline}</span>
          <div className="profile-mini-stats">
            <div><strong>{stats.connections}</strong><span>Connections</span></div>
            <div><strong>{stats.posts}</strong><span>Posts</span></div>
          </div>
        </div>
        <div className="card network-mini">
          <strong>Network</strong>
          <div className="network-row" onClick={() => navigate("/network")}>
            <span>Connections</span><span>{stats.connections}</span>
          </div>
          <div className="network-row" onClick={() => navigate("/network")}>
            <span>Follows</span><span>85</span>
          </div>
        </div>
      </aside>

      <section className="home-feed">
        <div className="card post-composer">
          <div className="composer-row">
            <Avatar user={activeUser} size={46} />
            <button className="composer-input" onClick={() => navigate("/create-post")}>
              Start a post, {firstName}?
            </button>
          </div>
          <div className="composer-actions">
            <button onClick={() => navigate("/create-post")}><Image size={18} /> Photo</button>
            <button onClick={() => navigate("/create-post")}><Video size={18} /> Video</button>
            <button onClick={() => navigate("/create-post")}><Calendar size={18} /> Event</button>
            <button onClick={() => navigate("/create-post")}><FileText size={18} /> Article</button>
          </div>
        </div>

        {feedPosts.map((p) => (
          <PostCard key={p._id || p.id} post={p} />
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
