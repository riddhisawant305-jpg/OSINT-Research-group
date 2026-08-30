import React, { useState } from "react";
import { ThumbsUp, MessageCircle, UserPlus, Briefcase, AtSign } from "lucide-react";
import { notifications } from "../data/dummyData";
import Avatar from "../component/Avatar";
import "./Notifications.css";

function Notifications() {
  const [list, setList] = useState(notifications);
  const [active, setActive] = useState("All");

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
        return { Icon: ThumbsUp, color: "#2563eb" };
    }
  };

  const filters = ["All", "Likes", "Comments", "Connections", "Jobs"];

  const filtered = list.filter((n) => {
    if (active === "All") return true;
    const map = { Likes: "like", Comments: "comment", Connections: "connection", Jobs: "job" };
    return n.type === map[active];
  });

  const markAll = () => setList((l) => l.map((n) => ({ ...n, read: true })));

  return (
    <div className="notifications-page">
      <div className="notify-head">
        <h1 className="section-title">Notifications</h1>
        <button className="mark-all" onClick={markAll}>Mark all as read</button>
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
        {filtered.map((n) => {
          const { Icon, color } = iconFor(n.type);
          return (
            <div key={n.id} className={"card notify-item" + (n.read ? "" : " unread")}>
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
                <small>{n.time} ago</small>
              </div>
              {!n.read && <span className="unread-dot"></span>}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card empty-state">No notifications here.</div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
