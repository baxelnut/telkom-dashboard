import React from "react";
import "./ReportTable.css";

export default function ReportTable({
  reportTableData,
  selectedCategory,
  selectedPeriod,
  loading,
  error,
}) {
  return (
    <div className="report-table">
      <p>ReportTable</p>
      <div>
        <p>selectedCategory: {selectedCategory}</p>
        <p>selectedPeriod: {selectedPeriod}</p>
      </div>
      {loading ? (
        <p>loading</p>
      ) : error ? (
        <p>error</p>
      ) : (
        <pre>{JSON.stringify(reportTableData, null, 2)}</pre>
      )}
    </div>
  );
}
