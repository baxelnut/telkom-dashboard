import React, { useEffect, useState } from "react";
import "./PerformancePage.css";
import PerformanceStatus from "./PerformanceStatus";

const counts = Object.fromEntries(
  ["Lanjut", "Cancel", "Bukan Order Reg", ""].map((key) => [key, 0])
);

const statusData = [
  {
    icon: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z",
    title: "Lanjut",
    value: counts.Lanjut,
    color: "rgb(var(--text-rgb), 1)",
    backgroundColor: "rgb(var(--success-rgb), 0.7)",
  },
  {
    icon: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z",
    title: "Cancel",
    value: counts.Cancel,
    color: "rgb(var(--text-rgb), 1)",
    backgroundColor: "rgb(var(--error-rgb), 0.7)",
  },
  {
    icon: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z",
    title: "Bukan Order Reg",
    value: counts["Bukan Order Reg"],
    color: "rgb(var(--text-rgb), 1)",
    backgroundColor: "rgb(255, 255, 0, 0.5)",
  },
  {
    icon: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z",
    title: "No status",
    value: counts[""],
    color: "rgb(var(--text-rgb), 1)",
    backgroundColor: "rgb(var(--text-variant-rgb), 0.5)",
  },
];

export default function PerformancePage() {
  return (
    <div className="performance-container">
      <div className="status-container">
        {statusData.map((item, index) => (
          <PerformanceStatus
            key={index}
            icon={item.icon}
            title={item.title}
            value={item.value}
            backgroundColor={item.backgroundColor}
            color={item.color}
          />
        ))}
      </div>

      <div className="summarize-container">
        <p>Performance details will be displayed here.</p>
        <p>Ensure that the data is updated in real-time for accuracy.</p>
        <p>Monitor the performance trends over time for better insights.</p>
        <p>Consider implementing alerts for significant performance changes.</p>
      </div>

      <div className="visualize-container">
        <div className="cards-container">
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

        <div className="graph-container">
          <div className="graph-content">
            <h5>Additional Insights</h5>
            <p>Graphs to showcase trends and patterns.</p>
            <pre>Insert convent here...</pre>
          </div>
        </div>
      </div>

      <div className="large-visualize-container">
        <h5>Large Visualization</h5>
        <div className="head">
          <p>Detailed graphs and charts for in-depth analysis.</p>
          <div className="comparison-desc">
            {statusData.map((item, index) => (
              <div key={index} className="comparison-item">
                <div className="comparison-icon">
                  <div
                    className="dot"
                    style={{ backgroundColor: item.backgroundColor }}
                  ></div>
                  <p>{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <pre>Insert convent here...</pre>
      </div>

      <div className="performance-table-container">
        <h5>Performance Table</h5>
        <p>Table to display detailed performance data.</p>
        <table className="table-wrapper"></table>
      </div>
    </div>
  );
}
