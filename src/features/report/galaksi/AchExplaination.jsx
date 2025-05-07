import React from "react";
import "./AchExplaination.css";

export default function AchExplanation() {
  return (
    <div className="ach-explanation">
      <p>
        <strong>0</strong> → <em>100%</em>
      </p>
      <p>
        <strong>1–5</strong> → <em>80%</em>
      </p>
      <p>
        <strong>6–10</strong> → <em>60%</em>
      </p>
      <p>
        <strong>11–20</strong> → <em>40%</em>
      </p>
      <p>
        <strong>&gt;20</strong> → <em>20%</em>
      </p>
    </div>
  );
}
