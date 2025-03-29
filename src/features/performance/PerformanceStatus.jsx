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
      className="performance-status"
      style={{ backgroundColor: backgroundColor, color: color }}
    >
      <div className="performance-status-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d={icon} />
        </svg>
      </div>

      <div className="performance-status-title">
        <h6>{title}</h6>
        <div className="performance-status-subtitle">
          <h3>{value}</h3>
        </div>
      </div>
    </div>
  );
}
