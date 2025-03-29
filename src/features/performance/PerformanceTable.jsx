import React from "react";
import "./PerformanceTable.css";

export default function PerformanceTable() {
  return (
    <div className="performance-table">
      <h5>Performance Table</h5>
      <p>Table to display detailed performance data.</p>
      
      <table className="table-wrapper"></table>
    </div>
  );
}
