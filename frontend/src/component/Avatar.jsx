import React from "react";
import "./Avatar.css";

function Avatar({ user = {}, size = 46, initials, color }) {
  const bg = user.avatarColor || color || "#2563eb";
  const text = user.initials || initials || (user.name ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2) : "?");

  return (
    <div
      className="cv-avatar"
      style={{ width: size, height: size, fontSize: size * 0.38, background: bg }}
      aria-label={user.name || "user"}
    >
      {text}
    </div>
  );
}

export default Avatar;
