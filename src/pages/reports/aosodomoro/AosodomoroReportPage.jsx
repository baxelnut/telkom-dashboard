import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
// Style
import "./AosodomoroReportPage.css";
// Components
import AosodomoroTableCard from "./AosodomoroTableCard";
import AosodomoroSelectedCard from "./AosodomoroSelectedCard";
import Checkbox from "../../../components/ui/input/Checkbox";
import Loading from "../../../components/ui/states/Loading";
// Custom hook & Context
import useFetchData from "../../../hooks/useFetchData";
import { useAuth } from "../../../context/AuthContext";
// Helpers
import { exportData } from "../../../helpers/exportHelpers";
import { ORDER_SUBTYPE } from "../../../helpers/aosodomoroUtils";

export default function AosodomoroReportPage({ API_URL }) {
  const { isAdmin } = useAuth();
  const { data, loading, error, raw } = useFetchData(
    `${API_URL}/regional-3/report`,
  );
  const [selectedSegmen, setSelectedSegmen] = useState("ALL");
  const [selectedExport, setSelectedExport] = useState("Excel");
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedSubtypes, setSelectedSubtypes] = useState(() => {
    const saved = localStorage.getItem("selectedSubtypes");
    return saved
      ? JSON.parse(saved)
      : ORDER_SUBTYPE.filter((subtype) =>
          ["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"].includes(subtype),
        );
  });
  const [teleStatus, setTeleStatus] = useState(null);
  const [gsheetStatus, setGsheetsStatus] = useState(null);

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
    customData = null,
  ) => {
    setSelectedExport(type);
    const flatData = customData
      ? customData
      : data.flatMap((entry) => {
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
              },
            );
          });
        });
    await exportData(type, flatData, customSheetName);
  };

  const isLoading = useMemo(() => {
    const check = (s) =>
      !!s && typeof s === "string" && s.toLowerCase().includes("please wait");
    return check(teleStatus) || check(gsheetStatus);
  }, [teleStatus, gsheetStatus]);

  return (
    <div className="report-page aosodomoro">
      <Helmet>
        <title>AOSODOMORO Report | Telkom</title>
        <meta
          name="description"
          content="Analytical report for AOSODOMORO initiatives, containing key performance indicators and strategic insights."
        />
      </Helmet>

      {isLoading && (
        <div className="loading-overlay">
          <Loading label="Working on it... Please do not close this window" />
        </div>
      )}

      {!selectedCell && (
        <div className="card aosodomoro filter">
          <div className="subtype-filter">
            {ORDER_SUBTYPE.map((subtype) => (
              <Checkbox
                key={subtype}
                label={subtype}
                checked={selectedSubtypes.includes(subtype)}
                onChange={() => handleCheckboxChange(subtype)}
              />
            ))}
          </div>
        </div>
      )}

      {!selectedCell ? (
        <AosodomoroTableCard
          data={data}
          raw={raw}
          loading={loading}
          error={error}
          selectedSegmen={selectedSegmen}
          selectedSubtypes={selectedSubtypes}
          selectedExport={selectedExport}
          onSegmenChange={setSelectedSegmen}
          onExportChange={setSelectedExport}
          onExport={handleExport}
          onCellSelect={setSelectedCell}
          API_URL={API_URL}
          setTeleStatus={setTeleStatus} // Pass down
          setGsheetsStatus={setGsheetsStatus} // Pass down
        />
      ) : (
        <AosodomoroSelectedCard
          selectedCell={selectedCell}
          data={data}
          selectedSegmen={selectedSegmen}
          selectedExport={selectedExport}
          onExportChange={setSelectedExport}
          onExport={handleExport}
          onBack={() => setSelectedCell(null)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
