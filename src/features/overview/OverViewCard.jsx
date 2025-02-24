import React from "react";
import "./OverViewCard.css";

export default function OverViewCard({
  title,
  amount,
  percentage,
  percentageSubtitle,
}) {
  const isPositive = percentage > 0;
  const percentageClass = isPositive ? "positive" : "negative";
  const symbol = percentage === 0 ? "+" : isPositive ? "+" : "";

  return (
    <div className="overview-card">
      <h6>{title}</h6>
      <h2>Rp{amount}</h2>
      <div className="comparison">
        <div className={`percentage ${percentageClass}`}>
          <h6>{`${symbol}${percentage}%`}</h6>
        </div>
        <p>{percentageSubtitle}</p>
      </div>
    </div>
  );
}
