import React from "react";
import "./GraphCard.css";

export default function GraphCard({ title, graphComponent }) {
  return (
    <div className="graph-card">
      <div className="head">
        <h4>{title}</h4>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
        </svg>
      </div>
      <div className="graph">
        {graphComponent ? graphComponent : <p>No graph available</p>}
      </div>
    </div>
  );
}
