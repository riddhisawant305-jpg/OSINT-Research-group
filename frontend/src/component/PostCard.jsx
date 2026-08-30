import React, { useState } from "react";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import Avatar from "./Avatar";
import "./PostCard.css";

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);

  const toggleLike = () => {
    setLiked((prev) => {
      setLikes((n) => n + (prev ? -1 : 1));
      return !prev;
    });
  };

  return (
    <article className="post-card">
      <div className="post-head">
        <Avatar user={post.user} size={46} />
        <div className="post-head-meta">
          <strong>{post.user.name}</strong>
          <span>{post.user.headline}</span>
          <small>{post.time} ago</small>
        </div>
      </div>

      <p className="post-body">{post.content}</p>

      <div className="post-stats">
        <span>
          <ThumbsUp size={14} /> {likes}
        </span>
        <span>{post.comments} comments · {post.shares} shares</span>
      </div>

      <div className="post-actions">
        <button className={"post-action" + (liked ? " liked" : "")} onClick={toggleLike}>
          <ThumbsUp size={18} /> <span>{liked ? "Liked" : "Like"}</span>
        </button>
        <button className="post-action" onClick={() => setShowComments((c) => !c)}>
          <MessageCircle size={18} /> <span>Comment</span>
        </button>
        <button className="post-action">
          <Share2 size={18} /> <span>Share</span>
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
          <div className="comment-input">
            <input placeholder="Add a comment..." />
            <button className="btn-primary">Post</button>
          </div>
        </div>
      )}
    </article>
  );
}

export default PostCard;
