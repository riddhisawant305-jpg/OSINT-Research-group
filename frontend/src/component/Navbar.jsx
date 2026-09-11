import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Briefcase,
  Bell,
  Users,
  LayoutDashboard,
  ChevronDown,
  User,
  Edit3,
  LogOut,
  Award,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import Avatar from "./Avatar";
import "./Navbar.css";

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const activeUser = user;
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isClickOpen, setIsClickOpen] = useState(false);
  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await API.get("/notifications");
        if (isMounted && res.data && typeof res.data.unreadCount === "number") {
          setUnreadCount(res.data.unreadCount);
        }
      } catch (e) {
        // unauthenticated or offline
      }
    };

    if (user) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 20000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [user]);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearCloseTimer();
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // If pinned open by click, do not close on mouse leave
    if (isClickOpen) return;

    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 350);
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    clearCloseTimer();
    if (dropdownOpen && isClickOpen) {
      // Toggle closed
      setDropdownOpen(false);
      setIsClickOpen(false);
    } else {
      // Open and pin
      setDropdownOpen(true);
      setIsClickOpen(true);
    }
  };

  const handleClose = () => {
    clearCloseTimer();
    setDropdownOpen(false);
    setIsClickOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearCloseTimer();
    };
  }, []);

  const isOrg = user?.role === "organization" || user?.role === "recruiter";

  const links = user ? [
    { to: "/home", label: "Home", Icon: Home },
    ...(!isOrg ? [{ to: "/jobs", label: "Jobs", Icon: Briefcase }] : []),
    { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    ...(isOrg ? [{ to: "/hired", label: "Hired", Icon: Award }] : []),
    { to: "/notifications", label: "Notifications", Icon: Bell, badge: unreadCount },
    { to: "/network", label: "Network", Icon: Users },
  ] : [
    { to: "/", label: "Home", Icon: Home },
    { to: "/about", label: "About Us", Icon: Users },
    { to: "/contact", label: "Contact & FAQs", Icon: Bell },
  ];

  if (user?.role === "admin") {
    links.push({ to: "/admin", label: "Admin Panel", Icon: LayoutDashboard });
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => navigate(user ? "/home" : "/")}>
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

        {user ? (
          <div
            className="navbar-profile-wrapper"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="navbar-profile"
              onClick={handleProfileClick}
              aria-expanded={dropdownOpen}
            >
              <Avatar user={activeUser} size={38} />
              <span className="navbar-profile-name">
                {activeUser.name ? activeUser.name.split(" ")[0] : "Profile"}
              </span>
              <ChevronDown size={14} className={"navbar-profile-arrow" + (dropdownOpen ? " open" : "")} />
            </div>

            {dropdownOpen && (
              <div
                className="navbar-dropdown-menu"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="navbar-dropdown-header">
                  <Avatar user={activeUser} size={40} />
                  <div className="navbar-dropdown-user-info">
                    <strong>{activeUser.name || "CareerVerse User"}</strong>
                    <span>{activeUser.headline || activeUser.email || "Professional"}</span>
                  </div>
                </div>
                <div className="navbar-dropdown-divider"></div>
                <button
                  type="button"
                  className="navbar-dropdown-item"
                  onClick={() => {
                    handleClose();
                    navigate("/profile");
                  }}
                >
                  <User size={16} />
                  <span>View profile</span>
                </button>
                <button
                  type="button"
                  className="navbar-dropdown-item"
                  onClick={() => {
                    handleClose();
                    navigate("/edit-profile");
                  }}
                >
                  <Edit3 size={16} />
                  <span>Edit profile</span>
                </button>
                {isOrg && (
                  <button
                    type="button"
                    className="navbar-dropdown-item"
                    onClick={() => {
                      handleClose();
                      navigate("/hired");
                    }}
                  >
                    <Award size={16} />
                    <span>Hired Candidates</span>
                  </button>
                )}
                <div className="navbar-dropdown-divider"></div>
                <button
                  type="button"
                  className="navbar-dropdown-item navbar-dropdown-logout"
                  onClick={() => {
                    handleClose();
                    logout();
                    navigate("/login");
                  }}
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="navbar-guest-actions">
            <button
              type="button"
              className="navbar-btn-login"
              onClick={() => navigate("/login")}
            >
              Log In
            </button>
            <button
              type="button"
              className="navbar-btn-signup"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
