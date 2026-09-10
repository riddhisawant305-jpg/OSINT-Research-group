import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThumbsUp, MessageCircle, Share2, Check, Trash2, FileText, Download } from "lucide-react";
import API from "../api/client";
import Avatar from "./Avatar";
import VerifiedBadge from "./VerifiedBadge";
import "./PostCard.css";

function PostCard({ post, onDelete }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.liked || false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [sharesCount, setSharesCount] = useState(post.shares || 0);
  const [copied, setCopied] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentsList, setCommentsList] = useState(post.commentsList || []);

  const toggleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikes((n) => Math.max(0, n + (nextLiked ? 1 : -1)));

    if (post._id) {
      try {
        const res = await API.post(`/posts/${post._id}/like`);
        if (res.data && typeof res.data.likesCount === "number") {
          setLikes(res.data.likesCount);
          setLiked(res.data.liked);
        }
      } catch (err) {
        console.warn("Could not like post:", err.message);
      }
    }
  };

  const handleShare = async () => {
    navigator.clipboard?.writeText(window.location.origin + `/posts/${post._id || post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    if (post._id) {
      try {
        const res = await API.post(`/posts/${post._id}/share`);
        if (res.data && typeof res.data.sharesCount === "number") {
          setSharesCount(res.data.sharesCount);
        } else {
          setSharesCount((c) => c + 1);
        }
      } catch (err) {
        setSharesCount((c) => c + 1);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const textToSend = commentText.trim();
    setCommentText("");

    const tempComment = {
      _id: Date.now().toString(),
      text: textToSend,
      createdAt: new Date().toISOString(),
      user: {
        name: "You",
        headline: "Career Enthusiast",
        avatarColor: "#2563eb",
      },
    };
    setCommentsList((prev) => [...prev, tempComment]);

    if (post._id) {
      try {
        const res = await API.post(`/posts/${post._id}/comments`, { text: textToSend });
        if (res.data && res.data.comments) {
          setCommentsList(res.data.comments);
        }
      } catch (err) {
        console.warn("Could not add comment:", err.message);
      }
    }
  };

  const handleAuthorClick = () => {
    const authorId = post.user?._id || post.user?.id;
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <article className="post-card">
      <div className="post-head">
        <div style={{ cursor: "pointer" }} onClick={handleAuthorClick} title="View profile">
          <Avatar user={post.user} size={46} />
        </div>
        <div className="post-head-meta">
          <strong
            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}
            onClick={handleAuthorClick}
            title="View profile"
          >
            {post.user?.name || "CareerVerse Member"}
            {post.user?.isVerified && <VerifiedBadge size={15} />}
          </strong>
          <span>{post.user?.headline || ""}</span>
          <small>{post.time ? `${post.time} ago` : "recently"}</small>
        </div>

        {onDelete && (
          <button
            type="button"
            className="post-delete-btn"
            onClick={onDelete}
            title="Delete this post"
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: "#ef4444",
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        )}
      </div>

      {post.content && <p className="post-body">{post.content}</p>}

      {post.media && (
        <div className="post-media-container" style={{ margin: "12px 0" }}>
          {post.mediaType === "video" ? (
            <video
              src={getMediaUrl(post.media)}
              controls
              style={{ width: "100%", maxHeight: "450px", borderRadius: "8px", background: "#000" }}
            />
          ) : post.mediaType === "document" ? (
            <a
              href={getMediaUrl(post.media)}
              target="_blank"
              rel="noreferrer"
              download={post.mediaName || "Document"}
              className="post-doc-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 18px",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                textDecoration: "none",
                color: "#1e293b",
                fontWeight: 500,
                transition: "background 0.2s ease",
              }}
            >
              <FileText size={28} color="#dc2626" />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <strong style={{ display: "block", fontSize: "14px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {post.mediaName || "Attached Document"}
                </strong>
                <small style={{ color: "#64748b" }}>Click to view / download document</small>
              </div>
              <Download size={18} color="#2563eb" />
            </a>
          ) : (
            <img
              src={getMediaUrl(post.media)}
              alt="Post attachment"
              style={{ width: "100%", maxHeight: "500px", objectFit: "cover", borderRadius: "8px" }}
            />
          )}
        </div>
      )}

      <div className="post-stats">
        <span>{likes} likes</span>
        <span>{commentsList.length || post.comments || 0} comments</span>
        <span>{sharesCount} shares</span>
      </div>

      <div className="post-actions">
        <button className={"post-action" + (liked ? " liked" : "")} onClick={toggleLike}>
          <ThumbsUp size={18} /> <span>{liked ? "Liked" : "Like"}</span>
        </button>
        <button className="post-action" onClick={() => setShowComments((c) => !c)}>
          <MessageCircle size={18} /> <span>Comment</span>
        </button>
        <button
          className={"post-action" + (copied ? " liked" : "")}
          onClick={handleShare}
          title="Copy link and share post"
        >
          {copied ? <Check size={18} color="#16a34a" /> : <Share2 size={18} />}
          <span style={copied ? { color: "#16a34a", fontWeight: 600 } : {}}>
            {copied ? "Link Copied!" : "Share"}
          </span>
        </button>
      </div>

      {showComments && (
        <div className="post-comments">
          {commentsList.map((c, idx) => (
            <div className="comment" key={c._id || idx}>
              <Avatar user={c.user || post.user} size={32} />
              <div className="comment-bubble">
                <strong style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  {c.user?.name || "Member"}
                  {c.user?.isVerified && <VerifiedBadge size={13} />}
                </strong>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
          {commentsList.length === 0 && (
            <p style={{ fontSize: "13px", color: "var(--cv-muted)", fontStyle: "italic", margin: "6px 0 12px 0" }}>
              No comments yet. Be the first to comment!
            </p>
          )}
          <form className="comment-input" onSubmit={handleAddComment}>
            <input
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="btn-primary">Post</button>
          </form>
        </div>
      )}
    </article>
  );
}

export default PostCard;
