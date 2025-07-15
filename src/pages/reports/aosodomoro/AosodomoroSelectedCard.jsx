import React from "react";
// Components
import Button from "../../../components/ui/buttons/Button";
import Dropdown from "../../../components/ui/input/Dropdown";
import SelectedTable from "../../../features/reports/aosodomoro/SelectedTable";
// Helpers
import { getExportOptions } from "../../../helpers/exportTableData";

export default function AosodomoroSelectedCard({
  selectedCell,
  data,
  selectedSegmen,
  selectedExport,
  onExportChange,
  onExport,
  onBack,
}) {
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
    <div className="card aosodomoro selected">
      <div className="filter-container back-btn">
        <div className="filter-items">
          <Button text="View full table" onClick={onBack} arrowLeft short />
        </div>
        <div className="filter-items">
          <Button
            text="Export as"
            onClick={() => onExport(selectedExport)}
            short
          />
          <Dropdown
            options={getExportOptions()}
            value={selectedExport}
            onChange={(e) => onExportChange(e.target.value)}
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
  );
}
