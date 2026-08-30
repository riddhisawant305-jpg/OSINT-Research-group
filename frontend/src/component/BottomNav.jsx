import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Briefcase, Plus, Bell, User } from "lucide-react";
import "./BottomNav.css";

function BottomNav() {
  const items = [
    { to: "/home", Icon: Home, label: "Home" },
    { to: "/jobs", Icon: Briefcase, label: "Jobs" },
    { to: "/create-post", Icon: Plus, label: "Post", center: true },
    { to: "/notifications", Icon: Bell, label: "Alerts" },
    { to: "/profile", Icon: User, label: "You" },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(({ to, Icon, label, center }) => {
        if (center) {
          return (
            <NavLink key={to} to={to} className="bottom-nav-item center">
              <span className="bottom-nav-center-btn">
                <Icon size={24} />
              </span>
            </NavLink>
          );
        }
        return (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              "bottom-nav-item" + (isActive ? " active" : "")
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default BottomNav;
