import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Send,
  Search,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Clock,
  CheckCheck,
  ShieldAlert,
} from "lucide-react";
import API from "../api/client";
import { useAuth } from "../context/AuthContext";
import Avatar from "../component/Avatar";
import VerifiedBadge from "../component/VerifiedBadge";
import "./Messages.css";

function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get("userId");

  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const chatBodyRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = (behavior = "smooth") => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Fetch conversations list
  const fetchConversations = async (selectUserId = null) => {
    try {
      const res = await API.get("/messages/conversations");
      if (res.data && res.data.data) {
        const convList = res.data.data;
        setConversations(convList);

        if (selectUserId) {
          const matched = convList.find(
            (c) => c.user._id === selectUserId || c.id === selectUserId
          );
          if (matched) {
            setActivePartner(matched.user);
          }
        } else if (!activePartner && convList.length > 0 && !queryUserId) {
          setActivePartner(convList[0].user);
        }
      }
    } catch (err) {
      console.warn("Could not fetch conversations:", err.message);
    } finally {
      setLoadingConvs(false);
    }
  };

  // Initial load
  useEffect(() => {
    const initMessages = async () => {
      setLoadingConvs(true);
      await fetchConversations(queryUserId);

      // If queryUserId is provided but not in existing conversations, fetch that user's profile
      if (queryUserId) {
        try {
          const userRes = await API.get(`/users/${queryUserId}`);
          if (userRes.data && userRes.data.data) {
            const fetched = userRes.data.data;
            setActivePartner({
              _id: fetched._id,
              name: fetched.name,
              headline: fetched.headline,
              avatarColor: fetched.avatarColor,
              profilePhoto: fetched.profilePhoto,
              isVerified: fetched.isVerified,
              messagingEnabled: fetched.messagingEnabled !== false,
              role: fetched.role,
            });
          }
        } catch (uErr) {
          console.warn("Could not fetch target conversation user:", uErr.message);
        }
      }
    };

    initMessages();
  }, [queryUserId]);

  // Fetch messages thread whenever activePartner changes
  useEffect(() => {
    let isSubscribed = true;

    const fetchThread = async () => {
      if (!activePartner?._id) return;
      setLoadingMessages(true);
      setSendError("");
      try {
        const res = await API.get(`/messages/${activePartner._id}`);
        if (!isSubscribed) return;
        if (res.data && res.data.data) {
          setMessages(res.data.data);
          setTimeout(() => scrollToBottom("auto"), 50);
        }
        if (res.data && res.data.partner) {
          setActivePartner((prev) => ({
            ...prev,
            ...res.data.partner,
          }));
        }
      } catch (err) {
        if (!isSubscribed) return;
        console.warn("Could not fetch messages thread:", err.message);
      } finally {
        if (isSubscribed) setLoadingMessages(false);
      }
    };

    fetchThread();

    return () => {
      isSubscribed = false;
    };
  }, [activePartner?._id]);

  // Live auto-polling for active chat thread & conversation list
  useEffect(() => {
    if (!activePartner?._id) return;

    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/messages/${activePartner._id}`);
        if (res.data && res.data.data) {
          setMessages((prev) => {
            if (prev.length !== res.data.data.length) {
              setTimeout(() => scrollToBottom("smooth"), 50);
              return res.data.data;
            }
            return prev;
          });
        }
        // Update partner messaging status
        if (res.data && res.data.partner) {
          setActivePartner((prev) => ({
            ...prev,
            ...res.data.partner,
          }));
        }
      } catch (e) {
        // quiet background refresh
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activePartner?._id]);

  const selectConversation = (partnerUser) => {
    setActivePartner(partnerUser);
    setSendError("");
    // Clear unread in local list
    setConversations((prev) =>
      prev.map((c) =>
        c.user._id === partnerUser._id ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activePartner?._id || sending) return;

    const textToSend = draft.trim();
    setSending(true);
    setSendError("");

    try {
      const res = await API.post(`/messages/${activePartner._id}`, {
        text: textToSend,
      });

      if (res.data && res.data.data) {
        const newMsg = res.data.data;
        setMessages((prev) => [...prev, newMsg]);
        setDraft("");
        setTimeout(() => scrollToBottom("smooth"), 40);

        // Update or add in conversation list
        setConversations((prev) => {
          const exists = prev.some((c) => c.user._id === activePartner._id);
          if (exists) {
            return prev.map((c) =>
              c.user._id === activePartner._id
                ? {
                    ...c,
                    lastMessage: {
                      _id: newMsg._id,
                      text: textToSend,
                      createdAt: new Date().toISOString(),
                      fromMe: true,
                      read: false,
                    },
                  }
                : c
            );
          } else {
            return [
              {
                id: activePartner._id,
                user: activePartner,
                lastMessage: {
                  _id: newMsg._id,
                  text: textToSend,
                  createdAt: new Date().toISOString(),
                  fromMe: true,
                  read: false,
                },
                unreadCount: 0,
              },
              ...prev,
            ];
          }
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to send message. Please verify network and messaging settings.";
      setSendError(msg);
    } finally {
      setSending(false);
    }
  };

  const isSelfDisabled = currentUser?.messagingEnabled === false;
  const isPartnerDisabled = activePartner?.messagingEnabled === false;
  const isBlocked = isSelfDisabled || isPartnerDisabled;

  const filteredConversations = conversations.filter((c) =>
    (c.user?.name || "").toLowerCase().includes(query.toLowerCase())
  );

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="messages-page card">
      {/* Sidebar: Conversations List */}
      <aside className="conversation-list">
        <div className="conv-header">
          <h2 style={{ margin: 0, fontSize: 17, display: "flex", alignItems: "center", gap: 8 }}>
            <MessageSquare size={18} color="var(--cv-blue)" /> Messages
          </h2>
          <span className="conv-count-badge">{conversations.length}</span>
        </div>

        <div className="conv-search">
          <Search size={16} />
          <input
            placeholder="Search conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="conversation-scroll">
          {loadingConvs ? (
            <div className="conv-loading">
              <Clock className="animate-spin" size={20} color="var(--cv-blue)" />
              <span>Loading messages...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="empty-conv-list">
              <MessageSquare size={32} color="#9ca3af" />
              <p>No conversations found</p>
              <small>Connect with fellow candidates or start a message from your network.</small>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const u = c.user;
              const isActive = activePartner?._id === u._id;
              return (
                <div
                  key={c.id || u._id}
                  className={"conv-item" + (isActive ? " active" : "")}
                  onClick={() => selectConversation(u)}
                >
                  <Avatar user={u} size={44} />
                  <div className="conv-meta">
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <strong className="conv-user-name">{u.name}</strong>
                      {u.isVerified && <VerifiedBadge size={13} />}
                    </div>
                    <p className="conv-preview">
                      {c.lastMessage?.fromMe ? "You: " : ""}
                      {c.lastMessage?.text || "No messages yet"}
                    </p>
                    <small className="conv-time">
                      {c.lastMessage?.createdAt
                        ? new Date(c.lastMessage.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </small>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="conv-unread">{c.unreadCount}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Window */}
      <section className="chat-window">
        {activePartner ? (
          <>
            {/* Chat Header */}
            <div className="chat-head">
              <div
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                onClick={() => navigate(`/profile/${activePartner._id}`)}
                title="View candidate profile"
              >
                <Avatar user={activePartner} size={42} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <strong style={{ fontSize: 15 }}>{activePartner.name}</strong>
                    {activePartner.isVerified && <VerifiedBadge size={14} />}
                    <span
                      className={`chat-partner-status-tag ${
                        activePartner.messagingEnabled !== false ? "online" : "offline"
                      }`}
                    >
                      {activePartner.messagingEnabled !== false ? "Available" : "Messaging Off"}
                    </span>
                  </div>
                  <small style={{ color: "var(--cv-muted)" }}>
                    {activePartner.headline || "CareerVerse Candidate"}
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="btn-outline view-profile-head-btn"
                onClick={() => navigate(`/profile/${activePartner._id}`)}
              >
                <ExternalLink size={13} /> Profile
              </button>
            </div>

            {/* Messaging Restriction Warnings */}
            {isSelfDisabled && (
              <div className="chat-restriction-alert self-disabled">
                <ShieldAlert size={18} />
                <div>
                  <strong>You have disabled direct messaging.</strong>
                  <p>
                    You cannot send or receive messages while your messaging preference is turned off.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ fontSize: 12, padding: "5px 12px" }}
                  onClick={() => navigate("/dashboard")}
                >
                  Enable in Dashboard
                </button>
              </div>
            )}

            {!isSelfDisabled && isPartnerDisabled && (
              <div className="chat-restriction-alert partner-disabled">
                <AlertCircle size={18} />
                <div>
                  <strong>{activePartner.name} has disabled direct messaging.</strong>
                  <p>
                    This candidate has turned off their messaging availability. You will be able to message them once they re-enable it.
                  </p>
                </div>
              </div>
            )}

            {sendError && (
              <div className="chat-send-error">
                <AlertCircle size={15} /> {sendError}
              </div>
            )}

            {/* Chat Body Thread */}
            <div className="chat-body" ref={chatBodyRef}>
              {loadingMessages ? (
                <div className="thread-loading">
                  <Clock className="animate-spin" size={24} color="var(--cv-blue)" />
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="empty-thread-state">
                  <div className="empty-thread-icon">
                    <MessageSquare size={36} color="var(--cv-blue)" />
                  </div>
                  <h4>Start a conversation with {activePartner.name}</h4>
                  <p>
                    Say hello, share insights, discuss interview preparation, or explore collaboration opportunities!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine =
                    m.sender === currentUser?._id ||
                    m.sender?._id === currentUser?._id;
                  return (
                    <div
                      key={m._id || m.id}
                      className={"chat-bubble" + (isMine ? " mine" : "")}
                    >
                      <div className="bubble-text">{m.text}</div>
                      <div className="bubble-footer">
                        <span className="bubble-time">
                          {formatMessageTime(m.createdAt)}
                        </span>
                        {isMine && (
                          <span className="bubble-read">
                            <CheckCheck size={13} color={m.read ? "#22c55e" : "#94a3b8"} />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Composer */}
            <form className="chat-input" onSubmit={handleSendMessage}>
              <input
                placeholder={
                  isSelfDisabled
                    ? "Enable messaging in your dashboard to send messages..."
                    : isPartnerDisabled
                    ? `${activePartner.name} has disabled direct messaging...`
                    : "Write a message to " + (activePartner.name?.split(" ")[0] || "candidate") + "..."
                }
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={isBlocked || sending}
              />
              <button
                type="submit"
                className="send-btn"
                aria-label="Send message"
                disabled={!draft.trim() || isBlocked || sending}
                title={isBlocked ? "Messaging disabled" : "Send message"}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="empty-state select-prompt">
            <MessageSquare size={48} color="#94a3b8" />
            <h3>Select a Conversation</h3>
            <p>Choose a candidate from the left list or message a connection to start networking.</p>
            <button
              className="btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => navigate("/network")}
            >
              Browse Network
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Messages;
