import React, { useState } from "react";
import "./ReportPage.css";
import Dropdown from "../../components/utils/Dropdown";
import Loading from "../../components/Loading";

const periodOptions = ["ALL", "1 month", "2 months", "3 months", "..."].map(
  (value) => ({ value, label: value })
);

const categoryOptions = ["ALL", "AO", "SO", "DO", "MO", "RO"].map((value) => ({
  value,
  label: value,
}));

export default function ReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  return (
    <div className="report-container">
      <div className="period-container">
        <div className="period-filter">
          <Dropdown
            options={periodOptions}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          />
          <p className="label">{`within ${selectedPeriod} period`}</p>
        </div>
      </div>

      <div className="report-table">
        <h5>{`Report for ${selectedCategory}`}</h5>
        <div className="category-filter">
          <p className="label">Category:</p>
          <Dropdown
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <Loading />
        </div>
      </div>
    </div>
  );
}
