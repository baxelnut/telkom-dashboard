import React from "react";
import "./PerformanceTable.css";
import Loading from "../../components/utils/Loading";

export default function PerformanceTable() {
  return (
    <div className="performance-table">
      <h5>Performance Table</h5>
      <p>Table to display detailed performance data.</p>

      <table className="table-wrapper">
        <Loading />
      </table>
    </div>
  );
}
