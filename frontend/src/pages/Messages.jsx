import React, { useState } from "react";
import { Send, Search } from "lucide-react";
import { messages as seedMessages } from "../data/dummyData";
import Avatar from "../component/Avatar";
import "./Messages.css";

function Messages() {
  const [conversations, setConversations] = useState(seedMessages);
  const [activeId, setActiveId] = useState(seedMessages[0].id);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const active = conversations.find((c) => c.id === activeId);

  const filtered = conversations.filter((c) =>
    c.user.name.toLowerCase().includes(query.toLowerCase())
  );

  const select = (id) => {
    setActiveId(id);
    setConversations((cs) =>
      cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const send = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setConversations((cs) =>
      cs.map((c) =>
        c.id === activeId
          ? { ...c, thread: [...c.thread, { from: "me", text: draft }] }
          : c
      )
    );
    setDraft("");
  };

  return (
    <div className="messages-page card">
      <aside className="conversation-list">
        <div className="conv-search">
          <Search size={17} />
          <input placeholder="Search messages" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="conversation-scroll">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={"conv-item" + (c.id === activeId ? " active" : "")}
              onClick={() => select(c.id)}
            >
              <Avatar user={c.user} size={44} />
              <div className="conv-meta">
                <strong>{c.user.name}</strong>
                <p>{c.preview}</p>
                <small>{c.time}</small>
              </div>
              {c.unread > 0 && <span className="conv-unread">{c.unread}</span>}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state" style={{ padding: 30 }}>No conversations</div>
          )}
        </div>
      </aside>

      <section className="chat-window">
        {active ? (
          <>
            <div className="chat-head">
              <Avatar user={active.user} size={38} />
              <div>
                <strong>{active.user.name}</strong>
                <small>{active.user.headline}</small>
              </div>
            </div>

            <div className="chat-body">
              {active.thread.map((m, i) => (
                <div
                  key={i}
                  className={"chat-bubble" + (m.from === "me" ? " mine" : "")}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <form className="chat-input" onSubmit={send}>
              <input
                placeholder="Write a message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" className="btn-primary send-btn" aria-label="Send">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="empty-state">Select a conversation to start chatting.</div>
        )}
      </section>
    </div>
  );
}

export default Messages;
