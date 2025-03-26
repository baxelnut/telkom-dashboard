import React from "react";
import "./OverViewRadar.css";

export default function OverViewRadar({ title, subtitle, overviewRadar }) {
  return (
    <div className="overtime-radar-container">
      <div className="overview-radar-title">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>

      <div className="overview-radar-content">
        <pre>{overviewRadar.content}</pre>
      </div>
    </div>
  );
}
