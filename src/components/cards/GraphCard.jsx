import React from "react";
import "./GraphCard.css";

export default function GraphCard({ title }) {
  return (
    <div className="graph-card">
      <div className="head">
        <h3>{title}</h3>
        <img src="src\assets\icons\three-dots.svg" alt="more" />
      </div>
      <div className="graph"></div>
    </div>
  );
}
