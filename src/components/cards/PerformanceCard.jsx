import React from "react";
import "./PerformanceCard.css";

export default function PerformanceCard({
  title,
  amount,
  percentage,
  percentageSubtitle,
}) {
  const isPositive = percentage > 0;
  const percentageClass = isPositive ? "positive" : "negative";
  const symbol = percentage === 0 ? "+" : isPositive ? "+" : "";

  return (
    <div className="performance-card">
      <h5>{title}</h5>
      <h1>Rp{amount}</h1>
      <div className="comparison">
        <div className={`percentage ${percentageClass}`}>
          <h6>{`${symbol}${percentage}%`}</h6>
        </div>
        <p>{percentageSubtitle}</p>
      </div>
    </div>
  );
}
