import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Briefcase, Bell, Users, LayoutDashboard } from "lucide-react";
import { currentUser } from "../data/dummyData";
import Avatar from "./Avatar";
import { unreadNotifications } from "../data/dummyData";
import "./Navbar.css";

export function Navbar() {
  const navigate = useNavigate();
  const unread = unreadNotifications || 0;

  const links = [
    { to: "/home", label: "Home", Icon: Home },
    { to: "/jobs", label: "Jobs", Icon: Briefcase },
    { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { to: "/notifications", label: "Notifications", Icon: Bell, badge: unread },
    { to: "/network", label: "Network", Icon: Users },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => navigate("/home")}>
          <div className="navbar-logo">CV</div>
          <span>
            Career<span>Verse</span>
          </span>
        </div>

        <nav className="navbar-links">
          {links.map(({ to, label, Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => "navbar-link" + (isActive ? " active" : "")}
            >
              <span className="navbar-link-icon">
                <Icon size={22} />
                {badge > 0 && <span className="nav-badge">{badge}</span>}
              </span>
              <span className="navbar-link-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="navbar-profile" onClick={() => navigate("/profile")}>
          <Avatar user={currentUser} size={38} />
          <span className="navbar-profile-name">{currentUser.name.split(" ")[0]}</span>
        </div>
      </div>
    </header>
  );
}
