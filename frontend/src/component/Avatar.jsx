import React, { useState } from "react";
import "./Avatar.css";

const resolvePhotoUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }
  const clean = url.startsWith("/") ? url : `/${url}`;
  return `http://localhost:5000${clean}`;
};

function Avatar({ user = {}, size = 46, initials, color }) {
  const [imgError, setImgError] = useState(false);
  const u = user || {};
  const bg = u.avatarColor || color || "#2563eb";
  const text =
    u.initials ||
    initials ||
    (u.name
      ? u.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
      : "?");

  const photoSrc = resolvePhotoUrl(u.profilePhoto);

  if (photoSrc && !imgError) {
    return (
      <img
        src={photoSrc}
        alt={u.name || "Avatar"}
        className="cv-avatar"
        style={{
          width: size,
          height: size,
          objectFit: "cover",
          borderRadius: "50%",
          flexShrink: 0,
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="cv-avatar"
      style={{ width: size, height: size, fontSize: size * 0.38, background: bg }}
      aria-label={u.name || "user"}
    >
      {text}
    </div>
  );
}

export default Avatar;
