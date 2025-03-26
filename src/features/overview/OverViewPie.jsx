import React from "react";
import "./OverViewPie.css";

export default function OverViewPie({ title, subtitle, overviewPie }) {
  return (
    <div className="overview-pie-container">
      <div className="overview-pie-title">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>

      <div className="overview-pie-content">
        <pre>{overviewPie.content}</pre>
      </div>
    </div>
  );
}
