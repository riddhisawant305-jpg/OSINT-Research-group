import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Video, Calendar, FileText, X } from "lucide-react";
import { currentUser } from "../data/dummyData";
import Avatar from "../component/Avatar";
import "../pages/CreatePost.css";

function CreatePost() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [privacy, setPrivacy] = useState("Anyone");

  const publish = () => {
    navigate("/home");
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
          <Avatar user={currentUser} size={46} />
          <div>
            <strong>{currentUser.name}</strong>
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
          <button className="btn-primary" onClick={publish} disabled={!text.trim()}>
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
