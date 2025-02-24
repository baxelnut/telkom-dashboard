import React from "react";
import "./GraphCard.css";

export default function GraphCard({ title, graphComponent }) {
  return (
    <div className="graph-card">
      <div className="head">
        <h4>{title}</h4>
        <img src="src/assets/icons/three-dots.svg" alt="more" />
      </div>
      <div className="graph">
        {graphComponent ? graphComponent : <p>No graph available</p>}
      </div>
    </div>
  );
}
