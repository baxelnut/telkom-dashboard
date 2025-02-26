import React from "react";
import "./ReportPage.css";
import ReportTable from "./ReportTable";

export default function ReportPage() {
  return (
    <div className="report">
      <div className="content">
        <div className="periode-filter">
          <h6>Periode</h6>
          <div className="filter-box">
            <div className="filter-field">
              <h6>ALL</h6>
            </div>
            <p>Select periode...</p>
          </div>
        </div>
        <div className="table-container">
          <h5>LOREM IPSUM DOLOR SIT AMET</h5>
          <h6>Periode: ALL</h6>
          <div className="table">
            <ReportTable filePath="/data/dummy.xlsx" />
          </div>
        </div>
      </div>
    </div>
  );
}
