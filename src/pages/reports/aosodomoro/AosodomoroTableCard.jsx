import { useState } from "react";
// Components
import AosodomoroTable from "../../../features/reports/aosodomoro/AosodomoroTable";
import Button from "../../../components/ui/buttons/Button";
import CardContent from "../../../components/ui/cards/CardContent";
import Dropdown from "../../../components/ui/input/Dropdown";
// Context
import { useAuth } from "../../../context/AuthContext";
// Data
import { SVG_PATHS } from "../../../data/utilData";
// Helpers
import { SEGMEN_OPS } from "../../../helpers/aosodomoroUtils";
import { getExportOptions } from "../../../helpers/exportTableData";
import { sendTableToTelegram } from "../../../features/bot/sendTableToTelegram";
import { formatDate } from "../../../helpers/formattingUtils";

export default function AosodomoroTableCard({
  data,
  loading,
  error,
  selectedSegmen,
  selectedSubtypes,
  selectedExport,
  onSegmenChange,
  onExportChange,
  onExport,
  onCellSelect,
  API_URL,
}) {
  const { isAdmin } = useAuth();
  const [status, setStatus] = useState("");

  const handleSendToTelegram = () => {
    sendTableToTelegram({
      selector: ".aosodomoro-table",
      apiUrl: API_URL,
      target: "group",
      setStatus,
      title: "Weekly Report AOSODOMORO Non Connectivity",
      subtext:
        "Source: Database NCX\n\nUntuk detail data dapat diakses melalui link berikut:",
      link: "https://rso2telkomdashboard.web.app/report/aosodomoro",
      dateStr: formatDate(),
    });
  };

  return (
    <div className="card aosodomoro table">
      <div className="title">
        <h6>
          Report for {selectedSegmen === "ALL" ? "All Segmen" : selectedSegmen}
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
            options={SEGMEN_OPS}
            value={selectedSegmen}
            onChange={(e) => onSegmenChange(e.target.value)}
            short
            chevronDown
          />
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

      {isAdmin && (
        <div className="filter-container announce">
          <p>{status}</p>
          <Button
            text="Announce!"
            iconPath={SVG_PATHS.telegram}
            onClick={handleSendToTelegram}
            backgroundColor={"var(--success)"}
            rounded
            iconAfter
          />
        </div>
      )}

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
                onCellSelect={onCellSelect}
              />
            )}
          </div>
        }
      />
    </div>
  );
}
