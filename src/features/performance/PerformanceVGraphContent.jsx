import React from "react";
import "./PerformanceVGraphContent.css";
import Loading from "../../components/utils/Loading";

export default function PerformanceVGraphContent() {
  return (
    <div className="v-graph-container">
      <div className="head">
        <h5>Additional Insights</h5>
        <p>Graphs to showcase trends and patterns.</p>
      </div>

      <div className="v-graph-content">
        <Loading />
      </div>
    </div>
  );
}
