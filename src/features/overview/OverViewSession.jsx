import React from "react";
import "./OverViewSession.css";

export default function OverViewSession({ title, subtitle, overviewSession }) {
  return (
    <div className="session-container">
      <div className="session-title">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>
      
      <div className="session-content">
        {overviewSession.map((customer, index) => (
          <div className="widget" key={index}>
            <div className="head">
              <h6 title={customer.name}>{customer.name}</h6>

              <h6>
                {customer.sessions} • {customer.percentage.toFixed(2)}%
              </h6>
            </div>
            <div className="session-bar-graph">
              <div
                className="session-bar-active"
                style={{ width: `${customer.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
