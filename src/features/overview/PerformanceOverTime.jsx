import React from "react";
import "./PerformanceOverTime.css";

export default function PerformanceOverTime({ data }) {
  return (
    <div className="p-over-time">
      <div className="head">
        <h4>Revenue Over Time</h4>
        <div className="actions">
          <img src="src\assets\icons\download.svg" alt="download" />
          <img src="src\assets\icons\three-dots.svg" alt="more" />
        </div>
      </div>
      <div className="info">
        {data.map((item, index) => (
          <div key={index} className={`total-p${index + 1}`}>
            <div className="leading"></div>
            <div className="main">
              <h6>{item.title}</h6>
              <h6 className="amount">Rp{item.amount}</h6>
            </div>
            <div className="trailing">
              <h3>{item.percentage}%</h3>
            </div>
          </div>
        ))}
      </div>
      <div className="graph-container">
        <div className="graph"></div>
      </div>
    </div>
  );
}
