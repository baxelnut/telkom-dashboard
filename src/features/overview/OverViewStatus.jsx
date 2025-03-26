import React from "react";
import "./OverViewStatus.css";

export default function OverViewStatus({ overviewStatus }) {
  const total = 100;

  const randomChange =
    Math.floor(Math.random() * 10) * (Math.random() < 0.5 ? -1 : 1);
  const previousTotal = total + randomChange;

  const percentageChange = previousTotal
    ? (((total - previousTotal) / previousTotal) * 100).toFixed(2)
    : "0.00";

  const isPositive = percentageChange >= 0;
  const percentageClass = isPositive ? "positive" : "negative";
  const symbol = percentageChange === "0.00" ? "" : isPositive ? "+" : "";

  return (
    <div className="overview-pie">
      <h5>{overviewStatus.title}</h5>

      <div className="overview-pie-content">
        <pre>{overviewStatus.content}</pre>
      </div>

      {/* random for now */}
      <h6>{Math.abs(randomChange * 10)}% Completed</h6>

      <div className="comparison">
        <div className={`percentage ${percentageClass}`}>
          {/* random for now */}
          <h6>{`${symbol}${percentageChange}%`}</h6>
        </div>
        <p>{overviewStatus.description}</p>
      </div>
    </div>
  );
}
