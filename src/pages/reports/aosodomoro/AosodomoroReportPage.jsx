import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// Style
import "./AosodomoroReportPage.css";
// Components
import AosodomoroTable from "../../../features/reports/aosodomoro/AosodomoroTable";
import Button from "../../../components/ui/buttons/Button";
import CardContent from "../../../components/ui/cards/CardContent";
import Checkbox from "../../../components/ui/input/Checkbox";
import Dropdown from "../../../components/ui/input/Dropdown";
import SelectedTable from "../../../features/reports/aosodomoro/SelectedTable";
// Custom hook
import useFetchData from "../../../hooks/useFetchData";

// Helpers
const orderSubtypes = [
  "PROV. COMPLETE",
  "PROVIDE ORDER",
  "IN PROCESS",
  "READY TO BILL",
];
const segmenOptions = [
  "ALL",
  "Regional",
  "Private Service",
  "State-Owned Enterprise Service",
  "Government",
].map((value) => ({ value, label: value }));

const exportOptions = ["Excel", "CSV"].map((val) => ({
  value: val,
  label: val,
}));

export default function AosodomoroReportPage({ API_URL }) {
  const { data, loading, error } = useFetchData(`${API_URL}/regional-3/report`);
  const [selectedSegmen, setSelectedSegmen] = useState("ALL");
  const [selectedExport, setSelectedExport] = useState("Excel");
  const [selectedCell, setSelectedCell] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSubtypes, setSelectedSubtypes] = useState(() => {
    const saved = localStorage.getItem("selectedSubtypes");
    return saved
      ? JSON.parse(saved)
      : orderSubtypes.filter((subtype) =>
          ["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"].includes(subtype)
        );
  });

  const refetch = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    localStorage.setItem("selectedSubtypes", JSON.stringify(selectedSubtypes));
  }, [selectedSubtypes]);

  const handleCheckboxChange = (subtype) => {
    setSelectedSubtypes((prev) => {
      const isSelected = prev.includes(subtype);
      return isSelected
        ? prev.filter((s) => s !== subtype)
        : [...prev, subtype];
    });
  };

  const handleExport = async (
    type,
    customSheetName = "AOSODOMORO Report",
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

  const cell = selectedCell || {};

  const titleSegments = [
    {
      label: "All Witel",
      value: cell.witelName,
      fallbackCheck: (val) => !val || val === "ALL",
    },
    {
      label: "All Kategori Umur",
      value: cell.kategoriUmur,
      fallbackCheck: (val) => !val || val === "both3bln",
    },
    {
      label: "All Subtype",
      value: cell.subType,
      fallbackCheck: (val) => !val || val === "ALL",
    },
  ];

  return (
    <div className="report-page aosodomoro">
      <Helmet>
        <title>AOSODOMORO Report | Telkom</title>
        <meta
          name="description"
          content="Analytical report for AOSODOMORO initiatives, containing key performance indicators and strategic insights."
        />
      </Helmet>

      <div className="card aosodomoro filter">
        <div className="subtype-filter">
          {orderSubtypes.map((subtype) => (
            <Checkbox
              key={subtype}
              label={subtype}
              checked={selectedSubtypes.includes(subtype)}
              onChange={() => handleCheckboxChange(subtype)}
            />
          ))}
        </div>
      </div>

      {!selectedCell ? (
        <div className="card aosodomoro table">
          <div className="title">
            <h6>
              Report for{" "}
              {selectedSegmen == "ALL" ? "All Segmen" : selectedSegmen}
            </h6>
            <div className="stats">
              <p>Total raw data: {data.totalRawData ?? " ..."} rows</p>
              <p>Processed into: {data.totalProcessedData ?? " ..."} rows</p>
            </div>
          </div>
          <div className="filter-container">
            <div className="filter-items">
              <p>Segmen:</p>
              <Dropdown
                options={segmenOptions}
                value={selectedSegmen}
                onChange={(e) => setSelectedSegmen(e.target.value)}
                short
                chevronDown
              />
            </div>
            <div className="filter-items">
              <Button
                text="Export as"
                onClick={() => handleExport(selectedExport)}
                short
              />
              <Dropdown
                options={exportOptions}
                value={selectedExport}
                onChange={(e) => setSelectedExport(e.target.value)}
                short
                chevronDown
              />
            </div>
          </div>
          <CardContent
            loading={loading}
            error={error}
            children={
              <div className="table-wrapper">
                {!selectedSubtypes.length ? (
                  <div className="empty-state">
                    <p className="small-p">
                      Please select at least one order subtype.
                    </p>
                  </div>
                ) : (
                  <AosodomoroTable
                    tableData={data}
                    selectedSegmen={selectedSegmen}
                    selectedSubtypes={selectedSubtypes}
                    onCellSelect={(cellData) => {
                      setSelectedCell(cellData);
                    }}
                  />
                )}
              </div>
            }
          />
        </div>
      ) : (
        <div className="card aosodomoro selected">
          <div className="filter-container">
            <div className="filter-items">
              <Button
                text="View full table"
                onClick={() => setSelectedCell(null)}
                arrowLeft
                short
              />
            </div>
            <div className="filter-items">
              <Button
                text="Export as"
                onClick={() => handleExport(selectedExport)}
                short
              />
              <Dropdown
                options={exportOptions}
                value={selectedExport}
                onChange={(e) => setSelectedExport(e.target.value)}
                short
                chevronDown
              />
            </div>
          </div>

          <div className="title">
            {titleSegments.map((segment, index) => (
              <React.Fragment key={index}>
                <h6>
                  {segment.fallbackCheck(segment.value)
                    ? segment.label
                    : segment.value}
                </h6>
                {index < titleSegments.length - 1 && <h6>→</h6>}
              </React.Fragment>
            ))}
          </div>

          <div className="table-wrapper">
            <SelectedTable
              selectedCell={selectedCell}
              selectedData={data}
              selectedSegmen={selectedSegmen}
            />
          </div>
        </div>
      )}
    </div>
  );
}
