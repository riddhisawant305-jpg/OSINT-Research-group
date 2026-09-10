import React from "react";
import "./VerifiedBadge.css";

/**
 * CareerVerse Verified Badge Component
 * Styled like Instagram's iconic 8-pointed scalloped starburst rosette
 * with an interior white checkmark.
 */
export default function VerifiedBadge({
  size = 16,
  showLabel = false,
  tooltip = "CareerVerse Verified",
  className = "",
}) {
  return (
    <span
      className={`cv-verified-badge-wrap ${className}`}
      title={tooltip}
      aria-label={tooltip}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="cv-verified-rosette-icon"
      >
        {/* Instagram-style 8-lobed scalloped starburst rosette */}
        <path
          d="M10.29 2.308a2.5 2.5 0 0 1 3.42 0l.662.613a2.5 2.5 0 0 0 2.32.622l.882-.218a2.5 2.5 0 0 1 2.96 1.71l.269.87a2.5 2.5 0 0 0 1.71 1.71l.87.269a2.5 2.5 0 0 1 1.71 2.96l-.218.882a2.5 2.5 0 0 0 .622 2.32l.613.662a2.5 2.5 0 0 1 0 3.42l-.613.662a2.5 2.5 0 0 0-.622 2.32l.218.882a2.5 2.5 0 0 1-1.71 2.96l-.87.269a2.5 2.5 0 0 0-1.71 1.71l-.269.87a2.5 2.5 0 0 1-2.96 1.71l-.882-.218a2.5 2.5 0 0 0-2.32.622l-.662.613a2.5 2.5 0 0 1-3.42 0l-.662-.613a2.5 2.5 0 0 0-2.32-.622l-.882.218a2.5 2.5 0 0 1-2.96-1.71l-.269-.87a2.5 2.5 0 0 0-1.71-1.71l-.87-.269a2.5 2.5 0 0 1-1.71-2.96l.218-.882a2.5 2.5 0 0 0-.622-2.32l-.613-.662a2.5 2.5 0 0 1 0-3.42l.613-.662a2.5 2.5 0 0 0 .622-2.32l-.218-.882a2.5 2.5 0 0 1 1.71-2.96l.87-.269a2.5 2.5 0 0 0 1.71-1.71l.269-.87a2.5 2.5 0 0 1 2.96-1.71l.882.218a2.5 2.5 0 0 0 2.32-.622l.662-.613Z"
          fill="#0095f6"
        />
        {/* Crisp interior white checkmark */}
        <path
          d="M8.5 12.5l2.5 2.5 5-5"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showLabel && <span className="cv-verified-label">CareerVerse Verified</span>}
    </span>
  );
}
