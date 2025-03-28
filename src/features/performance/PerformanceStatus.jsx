import React from "react";
import "./PerformanceStatus.css";

export default function PerformanceStatus({
  icon,
  title,
  value,
  backgroundColor,
  color,
}) {
  return (
    <div
      className="status"
      style={{ backgroundColor: backgroundColor, color: color }}
    >
      <div className="status-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d={icon} />
        </svg>
      </div>

      <div className="status-title">
        <h6>{title}</h6>
        <div className="status-subtitle">
          <h3>{value}</h3>
        </div>
      </div>
    </div>
  );
}
