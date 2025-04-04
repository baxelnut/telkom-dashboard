import React, { useState, useEffect } from "react";
import "./ReportPage.css";
import Dropdown from "../../components/utils/Dropdown";
import ReportTable from "./ReportTable";
import SelectedTable from "./SelectedTable";

const periodOptions = [
  "ALL",
  ...[1, 3, 6, 12, 24].map((n) => `${n} months`),
].map((value) => ({ value, label: value }));

const categoryOptions = ["ALL", ..."AO SO DO MO RO".split(" ")].map(
  (value) => ({ value, label: value })
);

const orderSubtypes = [
  "PROV. COMPLETE",
  "BILLING COMPLETED",
  "PROVIDE ORDER",
  "IN PROCESS",
  "READY TO BILL",
];

export default function ReportPage({ API_URL }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedSubtypes, setSelectedSubtypes] = useState(
    orderSubtypes.filter((subtype) =>
      ["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"].includes(subtype)
    )
  );
  const [selectedCell, setSelectedCell] = useState(null);

  const handleCellSelection = (cellData) => {
    setSelectedCell(cellData);
  };

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

  const handleCheckboxChange = (subtype) => {
    setSelectedSubtypes((prev) =>
      prev.includes(subtype)
        ? prev.filter((item) => item !== subtype)
        : [...prev, subtype]
    );
  };

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
        <div className="period-filter" style={{ flex: 1 }}>
          <p className="subtype-label" >Subtype:</p>
          <div className="subtype-filter-container">
            {orderSubtypes.map((subtype) => (
              <label key={subtype} className="subtype-filter">
                <input
                  type="checkbox"
                  checked={selectedSubtypes.includes(subtype)}
                  onChange={() => handleCheckboxChange(subtype)}
                />
                <p>{subtype}</p>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="report-table-container">
        <div className="title-container">
          <h5>{`Report for ${selectedCategory}`}</h5>

          <div>
            <p>Total raw data: {data.totalRawData ?? " ..."} rows</p>
            <p>Processed into: {data.totalProcessedData ?? " ..."} rows</p>
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
          <ReportTable
            reportTableData={data}
            selectedCategory={selectedCategory}
            selectedPeriod={selectedPeriod}
            orderSubtypes={selectedSubtypes}
            loading={loading}
            error={error}
            onCellSelect={handleCellSelection}
          />
        </div>
      </div>

      <div className="selected-table-container">
        <div className="title-container">
          <h5>Selected cell for {selectedCell?.witelName}</h5>
        </div>
        <p>Subtype: {selectedCell?.subType}</p>
        <p>Category: {selectedCell?.kategoriUmur}</p>

        <div className="table-wrapper">
          <SelectedTable
            selectedCell={selectedCell}
            data={data.data}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
    </div>
  );
}
