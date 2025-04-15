import React, { useState, useEffect } from "react";
import "./ReportPage.css";
import Dropdown from "../../components/utils/Dropdown";
import ReportTable from "./ReportTable";
import SelectedTable from "./SelectedTable";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
  const [inProcessData, setInProcessData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedExport, setSelectedExport] = useState("Excel");
  const [selectedCell, setSelectedCell] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [selectedSubtypes, setSelectedSubtypes] = useState(
    orderSubtypes.filter((subtype) =>
      ["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"].includes(subtype)
    )
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [response, inProcessResponse] = await Promise.all([
          fetch(`${API_URL}/regional_3/report`),
          fetch(`${API_URL}/regional_3/report/in_process`),
        ]);

        if (!response.ok || !inProcessResponse.ok) {
          throw new Error("❌ One or both API calls failed");
        }

        const [result, inProcessResult] = await Promise.all([
          response.json(),
          inProcessResponse.json(),
        ]);

        setData(result);
        setInProcessData(inProcessResult);
      } catch (err) {
        console.error("🚨 API Fetch Error:", err);
        setError(err.message || "Something went wrong while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCellSelection = (cellData) => {
    setSelectedCell(cellData);
  };

  const handleCheckboxChange = (subtype) => {
    setSelectedSubtypes((prev) => {
      const isSelected = prev.includes(subtype);
      if (!isSelected && subtype === "IN PROCESS") {
        return ["IN PROCESS"];
      }
      if (isSelected && subtype === "IN PROCESS") {
        return [];
      }
      if (!isSelected && prev.includes("IN PROCESS")) {
        return [...prev.filter((s) => s !== "IN PROCESS"), subtype];
      }
      return isSelected
        ? prev.filter((s) => s !== subtype)
        : [...prev, subtype];
    });
  };

  const getExportOptions = () => {
    const baseOptions = ["Excel", "CSV"];
    const extendedOptions = [...baseOptions];

    if (selectedSubtypes.length === 1 && selectedSubtypes[0] === "IN PROCESS") {
      extendedOptions.push("Spreadsheets");
    }

    return extendedOptions.map((value) => ({
      value,
      label: value,
    }));
  };

  const handleExport = async (
    type,
    customSheetName = "Report",
    customData = null
  ) => {
    setSelectedExport(type);

    // Special logic for "Spreadsheets" + IN PROCESS
    if (type === "Spreadsheets") {
      if (!inProcessData.data || !Array.isArray(inProcessData.data)) {
        return alert("No data to export bbb");
      }

      setExporting(true);
      try {
        const formattedData = [
          // Header Row 1
          [
            "Witel",
            "<3 BLN",
            "<3 BLN",
            "<3 BLN",
            "<3 BLN",
            "<3 BLN Total",
            ">3 BLN",
            ">3 BLN",
            ">3 BLN",
            ">3 BLN",
            ">3 BLN Total",
            "Grand Total",
          ],
          // Header Row 2
          [
            "",
            "Lanjut",
            "Cancel",
            "Bukan Order Reg",
            "No Status",
            "",
            "Lanjut",
            "Cancel",
            "Bukan Order Reg",
            "No Status",
            "",
            "",
          ],
          ...inProcessData.data.map((item) => {
            const lessThan3BlnItems = item["IN PROCESS"]["<3blnItems"];
            const greaterThan3BlnItems = item["IN PROCESS"][">3blnItems"];

            const countStatus = (items, status) =>
              items.filter((i) => i.in_process_status === status).length;

            const countNoStatus = (items) =>
              items.filter((i) => i.in_process_status === "").length;

            const lt3 = {
              lanjut: countStatus(lessThan3BlnItems, "Lanjut"),
              cancel: countStatus(lessThan3BlnItems, "Cancel"),
              bukan: countStatus(lessThan3BlnItems, "Bukan Order Reg"),
              noStatus: countNoStatus(lessThan3BlnItems),
            };

            const gt3 = {
              lanjut: countStatus(greaterThan3BlnItems, "Lanjut"),
              cancel: countStatus(greaterThan3BlnItems, "Cancel"),
              bukan: countStatus(greaterThan3BlnItems, "Bukan Order Reg"),
              noStatus: countNoStatus(greaterThan3BlnItems),
            };

            const lt3Total = lt3.lanjut + lt3.cancel + lt3.bukan + lt3.noStatus;

            const gt3Total = gt3.lanjut + gt3.cancel + gt3.bukan + gt3.noStatus;

            const grandTotal = lt3Total + gt3Total;

            return [
              item.witelName,
              lt3.lanjut,
              lt3.cancel,
              lt3.bukan,
              lt3.noStatus,
              lt3Total,
              gt3.lanjut,
              gt3.cancel,
              gt3.bukan,
              gt3.noStatus,
              gt3Total,
              grandTotal,
            ];
          }),
        ];

        const res = await fetch(`${API_URL}/export_to_sheet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: formattedData,
            sheetName: "In Progress Report",
          }),
        });

        const result = await res.json();

        if (res.ok) {
          alert("Exported to Google Sheet ✅");
        } else {
          throw new Error(result.error || "Export failed");
        }
      } catch (err) {
        alert(`❌ Export failed: ${err.message}`);
        console.error("Export error:", err);
      } finally {
        setExporting(false);
      }

      return;
    }

    // Regular export for Excel / CSV
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
      const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${customSheetName}.csv`);
    }

    console.log("✅ Exported as", type, "->", customSheetName);
  };

  return (
    <div className="report-container">
      <div
        className="period-container"
        style={{ display: selectedCell ? "none" : "flex" }}
      >
        <div className="period-filter">
          <Dropdown
            options={periodOptions}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          />
          <p className="label">{`within ${selectedPeriod} period`}</p>
        </div>
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
            <p className="label">Filtery by:</p>
            <Dropdown
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          </div>

          <div className="filter-container">
            <p className="label">Export as:</p>
            <Dropdown
              options={getExportOptions()}
              value={selectedExport}
              onChange={(e) => handleExport(e.target.value)}
            />
          </div>
        </div>
        <div className="table-wrapper">
          <ReportTable
            reportTableData={
              selectedSubtypes == "IN PROCESS" ? inProcessData : data
            }
            selectedCategory={selectedCategory}
            selectedPeriod={selectedPeriod}
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
            <p className="label">Export as:</p>
            <Dropdown
              options={getExportOptions()}
              value={selectedExport}
              onChange={(e) => handleExport(e.target.value)}
            />
          </div>
        </div>

        <div className="title-container">
          <h5>{selectedCell?.witelName}</h5>
          <h6>→</h6>
          <h5>{selectedCell?.kategoriUmur}</h5>
          <h6>→</h6>
          <h5>{selectedCell?.subType}</h5>
        </div>

        <div className="table-wrapper">
          <SelectedTable
            selectedCell={selectedCell}
            data={
              selectedSubtypes == "IN PROCESS" ? inProcessData.data : data.data
            }
            selectedCategory={selectedCategory}
            API_URL={API_URL}
          />
        </div>
      </div>
    </div>
  );
}
