import React from "react";
import "./PerformancePage.css";

export default function PerformanceWidget({
  icon,
  title,
  value,
  percentage,
  description,
}) {
  const isPositive = percentage > 0;
  const percentageClass = isPositive ? "positive" : "negative";
  const symbol = percentage === 0 ? "+" : isPositive ? "+" : "";

  return (
    <div className="p1-widget">
      <div className="leading">
        <img src={icon} alt="icon" />
      </div>
      <div className="title">
        <h5>{title}</h5>
        <div className="subtitle">
          <h2>{value}</h2>
          <p
            className={`percentage ${percentageClass}`}
          >{`${symbol}${percentage}%`}</p>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}
