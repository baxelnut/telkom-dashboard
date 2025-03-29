import React from "react";
import "./PerformanceVisualizeCards.css";

export default function PerformanceVisualizeCards() {
  return (
    <div className="visualize-cards-container">
      <div className="v-card">
        <h6>Card Title</h6>
        <h4>85</h4>
        <p>Additional information about the card.</p>
      </div>
      <div className="v-card">
        <h6>Card Title</h6>
        <h4>31</h4>
        <p>Additional information about the card.</p>
      </div>

      <div className="v-card">
        <h6>Card Title</h6>
        <h4>1</h4>
        <p>Additional information about the card.</p>
      </div>

      <div className="v-card">
        <h6>Card Title</h6>
        <h4>0</h4>
        <p>Additional information about the card.</p>
      </div>
    </div>
  );
}
