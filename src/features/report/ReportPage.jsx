import React, { useState, useEffect } from "react";
import "./ReportPage.css";
import Dropdown from "../../components/utils/Dropdown";

export default function ReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const periodOptions = [
    { value: "ALL", label: "ALL" },
    { value: "1 month", label: "1 month" },
    { value: "2 month", label: "2 month" },
    { value: "3 month", label: "3 month" },
    { value: "...", label: "..." },
  ];

  const categoryOptions = [
    { value: "ALL", label: "ALL" },
    { value: "AO", label: "AO" },
    { value: "SO", label: "SO" },
    { value: "DO", label: "DO" },
    { value: "MO", label: "MO" },
    { value: "RO", label: "RO" },
  ];

  return (
    <div className="report-container">
      <div className="period-container">
        <div className="period-filter">
          <Dropdown
            options={periodOptions}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          />
          <p className="label">Select period...</p>
        </div>
      </div>

      <div className="report-table">
        <h5>Report Table</h5>
        <div className="category-filter">
          <p className="label">Category:</p>
          <Dropdown
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>

        <div className="table-container"></div>
      </div>
    </div>
  );
}
