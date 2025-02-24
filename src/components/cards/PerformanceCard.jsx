import React from "react";
import "./PerformanceCard.css";

export default function PerformanceCard({
  title,
  amount,
  percentage,
  percentageSubtitle,
}) {
  const percentageClass = percentage > 0 ? "positive" : "negative";

  return (
    <div className="performance-card">
      <h5>{title}</h5>
      <h1>Rp{amount}</h1>
      <div className="comparison">
        <div className={`percentage ${percentageClass}`}>
          <h6>{percentage}%</h6>
        </div>
        <p>{percentageSubtitle}</p>
      </div>
    </div>
  );
}
