import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Video, Calendar, FileText, X } from "lucide-react";
import { currentUser as fallbackUser } from "../data/dummyData";
import { useAuth } from "../context/AuthContext";
import API from "../api/client";
import Avatar from "../component/Avatar";
import "../pages/CreatePost.css";

function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeUser = user || fallbackUser;

  const [text, setText] = useState("");
  const [privacy, setPrivacy] = useState("Anyone");
  const [submitting, setSubmitting] = useState(false);

  const publish = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await API.post("/posts", { content: text.trim(), privacy });
      navigate("/home");
    } catch (err) {
      console.warn("Could not post to backend:", err.message);
      navigate("/home");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="card create-post-card">
        <div className="create-post-head">
          <h2>Create a post</h2>
          <button className="icon-btn" onClick={() => navigate("/home")} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="create-post-user">
          <Avatar user={activeUser} size={46} />
          <div>
            <strong>{activeUser.name}</strong>
            <button
              className="privacy-btn"
              onClick={() =>
                setPrivacy((p) => (p === "Anyone" ? "Connections" : p === "Connections" ? "Only Me" : "Anyone"))
              }
            >{privacy} ▾</button>
          </div>
        </div>

        <textarea
          className="create-post-textarea"
          placeholder="What do you want to talk about?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
        />

        <div className="create-post-attach">
          <button><Image size={20} /><span>Photo</span></button>
          <button><Video size={20} /><span>Video</span></button>
          <button><Calendar size={20} /><span>Event</span></button>
          <button><FileText size={20} /><span>Write article</span></button>
        </div>

        <div className="create-post-footer">
          <span className="char-count">{text.length} / 3000</span>
          <button className="btn-primary" onClick={publish} disabled={!text.trim() || submitting}>
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
