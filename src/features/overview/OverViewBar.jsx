import React from "react";
import "./OverViewBar.css";

export default function OverViewBar({ title, subtitle, overviewBar }) {
  return (
    <div className="overview-bar-container">
      <div className="overview-bar-title">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>
      <div className="overview-bar-content">
        <pre>{overviewBar.content}</pre>
      </div>
    </div>
  );
}
