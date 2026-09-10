import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThumbsUp, MessageCircle, UserPlus, Briefcase, AtSign, CheckCheck } from "lucide-react";
import API from "../api/client";
import Avatar from "../component/Avatar";
import "./Notifications.css";

function Notifications() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      if (res.data && res.data.data) {
        setList(res.data.data);
      }
    } catch (err) {
      console.warn("Could not fetch notifications from backend:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const iconFor = (type) => {
    switch (type) {
      case "like":
        return { Icon: ThumbsUp, color: "#2563eb" };
      case "comment":
        return { Icon: MessageCircle, color: "#0891b2" };
      case "connection":
        return { Icon: UserPlus, color: "#7c3aed" };
      case "job":
        return { Icon: Briefcase, color: "#d97706" };
      case "mention":
        return { Icon: AtSign, color: "#dc2626" };
      default:
        return { Icon: Briefcase, color: "#2563eb" };
    }
  };

  const filters = ["All", "Likes", "Comments", "Connections", "Jobs"];

  const filtered = list.filter((n) => {
    if (active === "All") return true;
    const map = { Likes: "like", Comments: "comment", Connections: "connection", Jobs: "job" };
    return n.type === map[active];
  });

  const markAll = async () => {
    try {
      await API.put("/notifications/mark-all-read");
      setList((l) => l.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn("Could not mark all as read:", err.message);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.read && n._id) {
      try {
        await API.put(`/notifications/${n._id}/read`);
        setList((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, read: true } : item))
        );
      } catch (err) {
        console.warn("Could not mark notification as read:", err.message);
      }
    }

    if (n.link) {
      navigate(n.link);
    }
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return "recently";
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="notifications-page">
      <div className="notify-head">
        <h1 className="section-title">Notifications</h1>
        {list.some((n) => !n.read) && (
          <button className="mark-all" onClick={markAll} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      <div className="notify-tabs">
        {filters.map((f) => (
          <button
            key={f}
            className={"notify-tab" + (active === f ? " active" : "")}
            onClick={() => setActive(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="notify-list">
        {loading ? (
          <div className="card empty-state">Loading notifications...</div>
        ) : filtered.length > 0 ? (
          filtered.map((n) => {
            const { Icon, color } = iconFor(n.type);
            return (
              <div
                key={n._id || n.id}
                className={"card notify-item" + (n.read ? "" : " unread")}
                onClick={() => handleNotificationClick(n)}
                style={{ cursor: "pointer" }}
              >
                <span className="notify-icon" style={{ background: color }}>
                  <Icon size={18} />
                </span>
                {n.user ? (
                  <Avatar user={n.user} size={40} />
                ) : (
                  <span className="notify-icon empty"></span>
                )}
                <div className="notify-text">
                  <p>
                    <strong>{n.user ? n.user.name : "CareerVerse"}</strong> {n.text}
                  </p>
                  <small>{formatTime(n.createdAt)}</small>
                </div>
                {!n.read && <span className="unread-dot"></span>}
              </div>
            );
          })
        ) : (
          <div className="card empty-state">
            {active === "Jobs"
              ? "No job application updates yet. When employers update your application status, you'll see alerts here."
              : "No notifications here."}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
