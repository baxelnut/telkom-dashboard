import React, { useState, useEffect } from "react";
import "./ReportPage.css";
import Dropdown from "../../components/utils/Dropdown";
// import Loading from "../../components/utils/Loading";
import ReportTable from "./ReportTable";

const periodOptions = [
  "ALL",
  ...[1, 3, 6, 12, 24].map((n) => `${n} months`),
].map((value) => ({ value, label: value }));

const categoryOptions = ["ALL", ..."AO SO DO MO RO".split(" ")].map(
  (value) => ({ value, label: value })
);

export default function ReportPage({ API_URL }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/regional_3/report`);

        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("🚨 API Fetch Error:", error);
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

      <div className="report-table-container">
        <div className="title-container">
          <h5>{`Report for ${selectedCategory}`}</h5>

          <div>
            <p>Total Raw Data: {data.totalRawData}</p>
            <p>Processed into: {data.totalProcessedData}</p>
          </div>
        </div>

        <div className="category-filter">
          <p className="label">Category:</p>
          <Dropdown
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          {/* <Loading backgroundColor="transparent" /> */}
          <ReportTable
            reportTableData={data}
            selectedCategory={selectedCategory}
            selectedPeriod={selectedPeriod}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
