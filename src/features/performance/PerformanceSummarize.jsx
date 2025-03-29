import React from "react";
import "./Performancesummarize.css";

export default function PerformanceSummarize({ statusData }) {
  const totalValue = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="performance-summarize">
      <div className="summary-container">
        <h5>In Progress Status</h5>
        <p>Showing visualization for In Progress Status.</p>
        <div className="status-graph-container">
          {statusData.map((item, index) => {
            const itemPercentage = ((item.value / totalValue) * 100).toFixed(2);

            return (
              <div key={index} className="status-bar-container">
                <p className="status-text">{item.value}</p>

                <div className="object-container">
                  <p style={{ fontWeight: "bold" }}>{item.title}</p>

                  <div className="status-bar">
                    <div
                      className="status-bar-active"
                      style={{ width: `${itemPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <p
                  className="status-text"
                  style={{
                    width: "100px",
                    flexDirection: "column-reverse",
                    justifyContent: "center",
                    alignItems: "end",
                  }}
                >
                  {itemPercentage}%
                </p>
              </div>
            );
          })}
        </div>

        <table className="table-wrapper"></table>

        <h5>Summary</h5>
        <p>Showing summary for In Progress Status.</p>
        <table className="table-wrapper">
        </table>
      </div>

      <div className="detailed-container"></div>
    </div>
  );
}
