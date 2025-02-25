import React from "react";
import "./OverviewTable.css";
import CSVReader from "../../service/data/CSVReader";

export default function OverviewTable() {
  return (
    <div className="table-container">
      <h5>Data Overview</h5>
      <CSVReader filePath="/data/dummy.xlsx" />
    </div>
  );
}
