import React from "react";
import "./PerformanceOverTime.css";

export default function PerformanceOverTime({ data }) {
  return (
    <div className="p-over-time">
      <div className="head">
        <h4>Revenue Over Time</h4>
        <div className="actions">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
          </svg>
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
