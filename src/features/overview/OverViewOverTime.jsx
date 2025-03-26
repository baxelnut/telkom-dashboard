import React from "react";
import "./OverViewOverTime.css";

export default function OverViewOverTime({
  title,
  subtitle,
  overviewOvertimeInfo,
}) {
  return (
    <div className="overtime-container">
      <div className="overtime-title">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>
      <div className="info">
        {overviewOvertimeInfo.map((item, index) => (
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
      <div className="overtime-graph"></div>
    </div>
  );
}
