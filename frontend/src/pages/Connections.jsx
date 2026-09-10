import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, UserCheck, Users, Search, Building, Plus, Check } from "lucide-react";
import { connections as fallbackConnections } from "../data/dummyData";
import API from "../api/client";
import Avatar from "../component/Avatar";
import VerifiedBadge from "../component/VerifiedBadge";
import "./Connections.css";

function Connections() {
  const navigate = useNavigate();
  const [list, setList] = useState(fallbackConnections);
  const [tab, setTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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

  const isOrg = (u) =>
    u?.role === "organization" || u?.role === "recruiter" || !!u?.companyName;

  const counts = {
    All: validList.length,
    Connections: validList.filter((c) => c.connected).length,
    People: validList.filter((c) => !isOrg(c.user)).length,
    Organizations: validList.filter((c) => isOrg(c.user)).length,
  };

  const filtered = validList.filter((c) => {
    const u = c.user || {};
    const org = isOrg(u);

    // Tab filter
    if (tab === "Connections" && !c.connected) return false;
    if (tab === "People" && org) return false;
    if (tab === "Organizations" && !org) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = (u.name || "").toLowerCase();
      const headline = (u.headline || "").toLowerCase();
      const location = (u.location || "").toLowerCase();
      const company = (u.companyName || "").toLowerCase();
      const skills = Array.isArray(u.skills) ? u.skills.join(" ").toLowerCase() : "";
      return (
        name.includes(q) ||
        headline.includes(q) ||
        location.includes(q) ||
        company.includes(q) ||
        skills.includes(q)
      );
    }

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

      {/* People & Organization Search Bar */}
      <div
        className="card"
        style={{
          padding: "10px 14px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#f8fafc",
          borderRadius: "10px",
          border: "1px solid var(--cv-border)",
        }}
      >
        <Search size={18} color="var(--cv-muted)" />
        <input
          type="text"
          placeholder="Search candidates & organizations by name, role, company, or skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "14.5px",
            color: "var(--cv-text)",
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--cv-muted)",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Tabs: All, Connections, People, Organizations */}
      <div className="conn-tabs">
        {["All", "Connections", "People", "Organizations"].map((t) => (
          <button
            key={t}
            className={"conn-tab" + (tab === t ? " active" : "")}
            onClick={() => setTab(t)}
          >
            {t} <span className="tab-count">{counts[t] || 0}</span>
          </button>
        ))}
      </div>

      <div className="connections-grid">
        {filtered.map((c) => {
          const u = c.user || {};
          const profileId = u._id || u.id;
          const userIsOrg = isOrg(u);

          return (
            <div key={c._id || c.id} className="card connection-card">
              <div className="conn-card-cover"></div>
              <div
                style={{ cursor: profileId ? "pointer" : "default" }}
                onClick={() => profileId && navigate(`/profile/${profileId}`)}
              >
                <Avatar user={u} size={72} />
              </div>

              <div style={{ marginTop: 6, minHeight: 48 }}>
                <h3
                  style={{
                    cursor: profileId ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    margin: "4px 0",
                  }}
                  onClick={() => profileId && navigate(`/profile/${profileId}`)}
                  title="View Profile"
                >
                  <span>{u.name || "CareerVerse Member"}</span>
                  {u.isVerified && <VerifiedBadge size={16} />}
                </h3>

                {userIsOrg && (
                  <span className="conn-org-pill">
                    <Building size={11} /> Organization
                  </span>
                )}
              </div>

              <p>{u.headline || (userIsOrg ? "Hiring Organization" : "CareerVerse Professional")}</p>
              <small>
                {userIsOrg
                  ? `${c.mutual || 24} followers`
                  : `${c.mutual || 12} mutual connections`}
              </small>

              {/* Action Button: Connect for Candidates, Follow for Organizations */}
              {userIsOrg ? (
                <button
                  className={c.connected ? "conn-following" : "btn-outline conn-connect"}
                  onClick={() => toggle(c.id, profileId || c.id)}
                >
                  {c.connected ? (
                    <>
                      <Check size={15} /> Following
                    </>
                  ) : (
                    <>
                      <Plus size={15} /> Follow
                    </>
                  )}
                </button>
              ) : (
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
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card empty-state" style={{ marginTop: 20 }}>
          {searchQuery
            ? `No matches found for "${searchQuery}".`
            : tab === "Connections"
            ? "You don't have any connections yet. Connect with people or follow organizations to expand your network."
            : tab === "Organizations"
            ? "No organizations found."
            : tab === "People"
            ? "No candidates found."
            : "No network members here."}
        </div>
      )}
    </div>
  );
}

export default Connections;
