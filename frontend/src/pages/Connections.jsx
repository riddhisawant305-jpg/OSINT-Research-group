import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, UserCheck, Users } from "lucide-react";
import { connections as fallbackConnections } from "../data/dummyData";
import API from "../api/client";
import Avatar from "../component/Avatar";
import "./Connections.css";

function Connections() {
  const navigate = useNavigate();
  const [list, setList] = useState(fallbackConnections);
  const [tab, setTab] = useState("All");

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await API.get("/connections");
        if (res.data && res.data.data && res.data.data.length > 0) {
          setList(res.data.data);
        }
      } catch (err) {
        console.warn("Could not fetch connections from backend:", err.message);
      }
    };

    fetchConnections();
  }, []);

  const validList = (list || []).filter((c) => c && c.user);

  const counts = {
    All: validList.length,
    Connections: validList.filter((c) => c.connected).length,
    Requests: validList.filter((c) => !c.connected).length,
  };

  const filtered = validList.filter((c) => {
    if (tab === "Connections") return c.connected;
    if (tab === "Requests") return !c.connected;
    return true;
  });

  const toggle = async (id, targetUserId) => {
    setList((ls) =>
      ls.map((c) => (c.id === id ? { ...c, connected: !c.connected } : c))
    );

    const userIdToConnect = targetUserId || id;
    try {
      await API.post(`/connections/${userIdToConnect}`);
    } catch (err) {
      console.warn("Could not toggle connection:", err.message);
    }
  };

  return (
    <div className="connections-page">
      <div className="conn-head">
        <h1 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Users size={22} /> My Network
        </h1>
        <span className="total-count">{counts.All} total</span>
      </div>

      <div className="conn-tabs">
        {["All", "Connections", "Requests"].map((t) => (
          <button
            key={t}
            className={"conn-tab" + (tab === t ? " active" : "")}
            onClick={() => setTab(t)}
          >
            {t} <span className="tab-count">{counts[t]}</span>
          </button>
        ))}
      </div>

      <div className="connections-grid">
        {filtered.map((c) => {
          const u = c.user || {};
          const profileId = u._id || u.id;
          return (
            <div key={c._id || c.id} className="card connection-card">
              <div className="conn-card-cover"></div>
              <div
                style={{ cursor: profileId ? "pointer" : "default" }}
                onClick={() => profileId && navigate(`/profile/${profileId}`)}
              >
                <Avatar user={u} size={72} />
              </div>
              <h3
                style={{ cursor: profileId ? "pointer" : "default" }}
                onClick={() => profileId && navigate(`/profile/${profileId}`)}
                title="View Profile"
              >
                {u.name || "CareerVerse Member"}
              </h3>
              <p>{u.headline || "Professional"}</p>
              <small>{c.mutual || 12} mutual connections</small>
              <button
                className={c.connected ? "conn-connected" : "btn-outline conn-connect"}
                onClick={() => toggle(c.id, profileId || c.id)}
              >
                {c.connected ? (
                  <>
                    <UserCheck size={16} /> Connected
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> Connect
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Connections;
