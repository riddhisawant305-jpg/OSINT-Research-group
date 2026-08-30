import React, { useState } from "react";
import { UserPlus, UserCheck, Users } from "lucide-react";
import { connections } from "../data/dummyData";
import Avatar from "../component/Avatar";
import "./Connections.css";

function Connections() {
  const [list, setList] = useState(connections);
  const [tab, setTab] = useState("All");

  const counts = {
    All: list.length,
    Connections: list.filter((c) => c.connected).length,
    Requests: list.filter((c) => !c.connected).length,
  };

  const filtered = list.filter((c) => {
    if (tab === "Connections") return c.connected;
    if (tab === "Requests") return !c.connected;
    return true;
  });

  const toggle = (id) =>
    setList((ls) =>
      ls.map((c) => (c.id === id ? { ...c, connected: !c.connected } : c))
    );

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
        {filtered.map((c) => (
          <div key={c.id} className="card connection-card">
            <div className="conn-card-cover"></div>
            <Avatar user={c.user} size={72} />
            <h3>{c.user.name}</h3>
            <p>{c.user.headline}</p>
            <small>{c.mutual} mutual connections</small>
            <button
              className={c.connected ? "conn-connected" : "btn-outline conn-connect"}
              onClick={() => toggle(c.id)}
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
        ))}
      </div>
    </div>
  );
}

export default Connections;
