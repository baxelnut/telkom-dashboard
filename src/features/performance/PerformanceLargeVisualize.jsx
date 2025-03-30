import React from "react";
import "./PerformanceLargeVisualize.css";
import Loading from "../../components/Loading";

export default function PerformanceLargeVisualize({ statusData }) {
  return (
    <div className="large-visualize">
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

      <div className="large-visualize-content">
        <Loading />
      </div>
    </div>
  );
}
