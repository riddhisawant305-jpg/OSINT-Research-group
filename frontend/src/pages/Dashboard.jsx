import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import {
  Eye, Search, MessageSquare, TrendingUp, ArrowRight,
} from "lucide-react";
import { careerStats, skillProgress } from "../data/dummyData";
import "./Dashboard.css";

const activity = [
  { month: "Jan", views: 120, searches: 90 },
  { month: "Feb", views: 150, searches: 110 },
  { month: "Mar", views: 180, searches: 130 },
  { month: "Apr", views: 210, searches: 160 },
  { month: "May", views: 240, searches: 180 },
  { month: "Jun", views: 245, searches: 190 },
];

function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: "Profile Views", value: careerStats.profileViews, Icon: Eye, trend: "+12%" },
    { label: "Search Appearances", value: careerStats.searchAppearances, Icon: Search, trend: "+8%" },
    { label: "Application Views", value: careerStats.applicationViews, Icon: TrendingUp, trend: "+20%" },
    { label: "Interview Invites", value: careerStats.interviewInvites, Icon: MessageSquare, trend: "+2" },
  ];

  return (
    <div className="dashboard-page">
      <div className="dash-head">
        <div>
          <h1 className="section-title">Career Dashboard</h1>
          <p className="dash-subtitle">Track your professional growth at a glance.</p>
        </div>
        <button className="btn-primary dash-btn" onClick={() => navigate("/dashboard")}>
          Refresh <ArrowRight size={16} />
        </button>
      </div>

      <div className="stat-grid">
        {stats.map(({ label, value, Icon, trend }) => (
          <div key={label} className="card stat-card">
            <div className="stat-top">
              <span className="stat-icon"><Icon size={20} /></span>
              <span className="stat-trend">{trend}</span>
            </div>
            <strong>{value}</strong>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card dash-chart">
          <h3>Profile Activity</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="searches" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card dash-chart">
          <h3>Skill Proficiency</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={skillProgress} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="level" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card dash-strength">
        <div>
          <h3>Profile Strength</h3>
          <p className="dash-subtitle">Boost it to get more recruiter attention.</p>
        </div>
        <div className="strength-ring" style={{ background: `conic-gradient(#7c3aed ${careerStats.profileStrength}%, #e5e7eb 0)` }}>
          <div className="strength-inner"><strong>{careerStats.profileStrength}%</strong></div>
        </div>
        <button className="btn-outline" onClick={() => navigate("/edit-profile")}>
          Improve Profile
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
