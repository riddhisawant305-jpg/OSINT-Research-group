import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThumbsUp, MessageCircle, Share2, Check } from "lucide-react";
import API from "../api/client";
import Avatar from "./Avatar";
import "./PostCard.css";

function PostCard({ post }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.liked || false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [sharesCount, setSharesCount] = useState(post.shares || 0);
  const [copied, setCopied] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentsList, setCommentsList] = useState([]);

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
        // Revert on error
        setLiked(!nextLiked);
        setLikes((n) => Math.max(0, n + (nextLiked ? -1 : 1)));
      }
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/home#post-${post._id || post.id || ""}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(postUrl);
      }
    } catch (clipErr) {
      console.warn("Clipboard access denied:", clipErr);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);

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

    if (post._id) {
      try {
        const res = await API.post(`/posts/${post._id}/comments`, { text: textToSend });
        if (res.data && res.data.data) {
          setCommentsList((prev) => [...prev, res.data.data]);
        }
      } catch (err) {
        console.warn("Could not post comment:", err.message);
      }
    }
  };

  const handleAuthorClick = () => {
    const authorId = post.user?._id || post.user?.id;
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  return (
    <article className="post-card">
      <div className="post-head">
        <div style={{ cursor: "pointer" }} onClick={handleAuthorClick} title="View profile">
          <Avatar user={post.user} size={46} />
        </div>
        <div className="post-head-meta">
          <strong
            style={{ cursor: "pointer" }}
            onClick={handleAuthorClick}
            title="View profile"
          >
            {post.user.name}
          </strong>
          <span>{post.user.headline}</span>
          <small>{post.time ? `${post.time} ago` : "recently"}</small>
        </div>
      </div>

      <p className="post-body">{post.content}</p>

      <div className="post-stats">
        <span>
          <ThumbsUp size={14} /> {likes}
        </span>
        <span>
          {(post.comments || 0) + commentsList.length} comments · {sharesCount} shares
        </span>
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
          <div className="comment">
            <Avatar user={post.user} size={32} />
            <div className="comment-bubble">
              <strong>{post.user.name}</strong>
              <p>Great post! Thanks for sharing 🙌</p>
            </div>
          </div>
          {commentsList.map((c, idx) => (
            <div className="comment" key={idx}>
              <Avatar user={c.user || post.user} size={32} />
              <div className="comment-bubble">
                <strong>{c.user?.name || "Member"}</strong>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
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
