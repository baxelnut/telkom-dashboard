import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
// Style
import "./AosodomoroReportPage.css";
// Components
import AosodomoroTableCard from "./AosodomoroTableCard";
import AosodomoroSelectedCard from "./AosodomoroSelectedCard";
import Checkbox from "../../../components/ui/input/Checkbox";
// Custom hook
import useFetchData from "../../../hooks/useFetchData";
// Helpers
import { exportData } from "../../../helpers/exportTableData";
import { ORDER_SUBTYPE } from "../../../helpers/aosodomoroUtils";

export default function AosodomoroReportPage({ API_URL }) {
  const { data, loading, error } = useFetchData(`${API_URL}/regional-3/report`);
  const [selectedSegmen, setSelectedSegmen] = useState("ALL");
  const [selectedExport, setSelectedExport] = useState("Excel");
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedSubtypes, setSelectedSubtypes] = useState(() => {
    const saved = localStorage.getItem("selectedSubtypes");
    return saved
      ? JSON.parse(saved)
      : ORDER_SUBTYPE.filter((subtype) =>
          ["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"].includes(subtype)
        );
  });

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
              }
            );
          });
        });
    await exportData(type, flatData, customSheetName);
  };

  return (
    <div className="report-page aosodomoro">
      <Helmet>
        <title>AOSODOMORO Report | Telkom</title>
        <meta
          name="description"
          content="Analytical report for AOSODOMORO initiatives, containing key performance indicators and strategic insights."
        />
      </Helmet>

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
        />
      )}
    </div>
  );
}
