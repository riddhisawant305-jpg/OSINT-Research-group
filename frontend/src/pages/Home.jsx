import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Video, FileText, Bot, FileBadge, Mic, Briefcase, Users, Award } from "lucide-react";
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
  const isOrg = activeUser.role === "organization" || activeUser.role === "recruiter";

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
        if (res.data && res.data.data) {
          const { careerStats, recruiterStats, user: dashUser } = res.data.data;
          if (careerStats) {
            setStats({
              connections: careerStats.connectionsCount || activeUser.connections || 0,
              posts: careerStats.postsCount || activeUser.posts || 0,
            });
          } else if (recruiterStats) {
            setStats({
              connections: activeUser.connections || 0,
              posts: recruiterStats.jobsPostedCount || 0,
            });
          }
        }
      } catch (err) {
        console.warn("Could not fetch user stats:", err.message);
      }
    };

    fetchPosts();
    fetchStats();
  }, []);

  const tools = [
    { to: "/mentor", Icon: Bot, label: "AI Career Mentor", color: "#7c3aed" },
    { to: "/resume", Icon: FileBadge, label: "Resume Analyzer", color: "#2563eb" },
    { to: "/practice-interview", Icon: Mic, label: "Practice Interview", color: "#0891b2" },
  ];

  const orgTools = [
    { to: "/dashboard", Icon: Briefcase, label: "Manage Jobs & Openings", color: "#2563eb" },
    { to: "/dashboard", Icon: Users, label: "Review Applications", color: "#0891b2" },
    { to: "/dashboard", Icon: Award, label: "Hired from CareerVerse", color: "#059669" },
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
            <button onClick={() => navigate("/create-post")}><FileText size={18} /> Add Document</button>
          </div>
        </div>

        {feedPosts.map((p) => (
          <PostCard key={p._id || p.id} post={p} />
        ))}
      </section>

      <aside className="home-side right">
        {!isOrg ? (
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
        ) : (
          <div className="card tools-card">
            <h4>Recruitment Hub</h4>
            {orgTools.map(({ to, Icon, label, color }, idx) => (
              <button key={idx} className="tool-row" onClick={() => navigate(to)}>
                <span className="tool-icon" style={{ background: color }}><Icon size={18} /></span>
                <span>{label}</span>
                <span className="tool-arrow">›</span>
              </button>
            ))}
          </div>
        )}
        <div className="card dashboard-mini" onClick={() => navigate("/dashboard")}>
          <strong>{isOrg ? "Organization Dashboard" : "Career Dashboard"}</strong>
          <span>{isOrg ? "Track applications & hiring insights ›" : "Track your progress and insights ›"}</span>
        </div>
      </aside>
    </div>
  );
}

export default Home;
