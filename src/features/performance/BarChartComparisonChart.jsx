import React from "react";
import "./PerformancePage.css";

export default function BarChartComparisonChart({ data }) {
  return (
    <div className="bar-chart-c">
      <div className="head">
        <h2>{data.title}</h2>
        <img src="src/assets/icons/three-dots.svg" alt="more" />
      </div>
      {data.bars.map((bar, index) => (
        <div key={index} className="graph">
          <div className="p-holder">
            <p>{bar.percentage}%</p>
          </div>
          <div className="holder">
            <div
              className="active-bar"
              style={{ width: `${bar.percentage}%` }}
            ></div>
          </div>
          <div className="p-holder">
            <p>{bar.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
