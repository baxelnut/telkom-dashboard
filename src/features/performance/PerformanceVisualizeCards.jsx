import React from "react";
import "./PerformanceVisualizeCards.css";

export default function PerformanceVisualizeCards({ statusData }) {
  return (
    <div className="visualize-cards-container">
      {statusData.map((item, index) => {
        return (
          <div key={index} className="v-card">
            <h6>{item.title}</h6>
            <h4>{item.value}</h4>
            <p>Additional information about the card.</p>
          </div>
        );
      })}
    </div>
  );
}
