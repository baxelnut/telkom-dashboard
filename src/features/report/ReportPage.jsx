import React, { useState, useEffect } from "react";
import "./ReportPage.css";
import Dropdown from "../../components/utils/Dropdown";
import ReportTable from "./ReportTable";
import SelectedTable from "./SelectedTable";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// const periodOptions = [
//   "ALL",
//   ...[1, 3, 6, 12, 24].map((n) => `${n} months`),
// ].map((value) => ({ value, label: value }));

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

export default function ReportPage({ API_URL, userEmail }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [selectedPeriod, setSelectedPeriod] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedExport, setSelectedExport] = useState("Excel");
  const [selectedCell, setSelectedCell] = useState(null);
  // const [exporting, setExporting] = useState(false);
  const [selectedSubtypes, setSelectedSubtypes] = useState(() => {
    const saved = localStorage.getItem("selectedSubtypes");
    return saved
      ? JSON.parse(saved)
      : orderSubtypes.filter((subtype) =>
          ["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"].includes(subtype)
        );
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    localStorage.setItem("selectedSubtypes", JSON.stringify(selectedSubtypes));
  }, [selectedSubtypes]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/regional_3/report`);
        if (!response.ok) throw new Error("❌ API call failed");
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("🚨 API Fetch Error:", err);
        setError(err.message || "Something went wrong while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // const interval = setInterval(fetchData, 10000); // refresh every 10s
    // return () => clearInterval(interval); // cleanup
  }, [refreshKey]);

  const handleCellSelection = (cellData) => {
    setSelectedCell(cellData);
  };

  const handleCheckboxChange = (subtype) => {
    setSelectedSubtypes((prev) => {
      const isSelected = prev.includes(subtype);
      return isSelected
        ? prev.filter((s) => s !== subtype)
        : [...prev, subtype];
    });
  };

  const getExportOptions = () => {
    return ["Excel", "CSV"].map((value) => ({ value, label: value }));
  };

  const handleExport = async (
    type,
    customSheetName = "Report",
    customData = null
  ) => {
    setSelectedExport(type);

    const exportData = customData
      ? customData
      : data.data?.flatMap((entry) => {
          const witel = entry.witelName;
          return Object.entries(entry).flatMap(([subtype, values]) => {
            if (subtype === "witelName") return [];
            return Object.entries(values || {}).flatMap(
              ([ageCategory, value]) => {
                if (!Array.isArray(value)) return [];
                return value.map((item) => ({
                  witel,
                  subType: subtype,
                  ageCategory,
                  ...item,
                }));
              }
            );
          });
        });

    if (!exportData || exportData.length === 0) {
      alert("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, customSheetName);

    if (type === "Excel") {
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `${customSheetName}.xlsx`);
    } else if (type === "CSV") {
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvOutput], {
        type: "text/csv;charset=utf-8;",
      });
      saveAs(blob, `${customSheetName}.csv`);
    }
  };

  return (
    <div className="report-container">
      <div
        className="period-container"
        style={{ display: selectedCell ? "none" : "flex" }}
      >
        {/* <div className="period-filter">
          <Dropdown
            options={periodOptions}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          />
          <p className="label">{`within ${selectedPeriod} period`}</p>
        </div> */}
        <div className="period-filter" style={{ flex: 1 }}>
          <p className="subtype-label">Subtype:</p>
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

      <div
        className="report-table-container"
        style={{ display: selectedCell ? "none" : "flex" }}
      >
        <div className="title-container">
          <h5>{`Report for ${selectedCategory}`}</h5>

          <div>
            <p>Total raw data: {data.totalRawData ?? " ..."} rows</p>
            <p>Processed into: {data.totalProcessedData ?? " ..."} rows</p>
          </div>
        </div>

        <div className="category-filter">
          <div className="filter-container">
            <p className="label">Filter:</p>
            <Dropdown
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          </div>

          <div className="filter-container">
            <button
              className="label"
              onClick={() => handleExport(selectedExport)}
            >
              <p>Export as</p>
            </button>
            <Dropdown
              options={getExportOptions()}
              value={selectedExport}
              onChange={(e) => setSelectedExport(e.target.value)}
            />
          </div>
        </div>
        <div className="table-wrapper">
          <ReportTable
            reportTableData={data}
            selectedCategory={selectedCategory}
            // selectedPeriod={selectedPeriod}
            orderSubtypes={selectedSubtypes}
            loading={loading}
            error={error}
            onCellSelect={handleCellSelection}
          />
        </div>
      </div>

      <div
        className="selected-table-container"
        style={{ display: selectedCell ? "flex" : "none" }}
      >
        <div className="back-button-container">
          <button onClick={() => setSelectedCell(null)}>
            <p>← View full table</p>
          </button>

          <div className="filter-container">
            <button
              className="label"
              onClick={() => handleExport(selectedExport)}
            >
              <p>Export as</p>
            </button>
            <Dropdown
              options={getExportOptions()}
              value={selectedExport}
              onChange={(e) => setSelectedExport(e.target.value)}
            />
          </div>
        </div>

        <div className="title-container">
          <h5>
            {selectedCell?.witelName === "ALL" ||
            selectedCell?.witelName === null ||
            selectedCell?.witelName === ""
              ? "All Witel"
              : selectedCell?.witelName}
          </h5>
          <h6>→</h6>
          <h5>
            {selectedCell?.kategoriUmur === "both3bln" ||
            selectedCell?.kategoriUmur === null ||
            selectedCell?.kategoriUmur === ""
              ? "All Kategori Umur"
              : selectedCell?.kategoriUmur}
          </h5>
          <h6>→</h6>
          <h5>
            {selectedCell?.subType === "ALL" ||
            selectedCell?.subType === null ||
            selectedCell?.subType === ""
              ? "All Subtype"
              : selectedCell?.subType}
          </h5>
        </div>

        <div className="table-wrapper">
          <SelectedTable
            selectedCell={selectedCell}
            data={data.data}
            selectedCategory={selectedCategory}
            API_URL={API_URL}
            userEmail={userEmail}
            onUpdateSuccess={refetch}
          />
        </div>
      </div>
    </div>
  );
}
