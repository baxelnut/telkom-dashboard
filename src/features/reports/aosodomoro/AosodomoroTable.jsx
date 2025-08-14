import { useState } from "react";
// Style
import "./AosodomoroTable.css";
// Components
import { AosodomoroTableBody } from "./AosodomoroTableBody";
import Button from "../../../components/ui/buttons/Button";
// Context & Data
import { useAuth } from "../../../context/AuthContext";
import { SVG_PATHS } from "../../../data/utilsData";
// Helpers
import { formatDate } from "../../../helpers/formattingUtils";
import { sendTableToTelegram } from "../../bot/sendTableToTelegram";
import { refreshGsheets } from "../../trigger/refreshGsheets";

export default function AosodomoroTable({
  API_URL,
  tableData,
  selectedSegmen,
  selectedSubtypes,
  onCellSelect,
  setTeleStatus, // Received from parent
  setGsheetsStatus, // Received from parent
}) {
  const { isAdmin } = useAuth();
  const [selectedCell, setSelectedCell] = useState(null);

  const handleCellClick = (celltableData) => {
    setSelectedCell(celltableData);
    onCellSelect(celltableData);
  };

  const handleRefreshGsheets = () => {
    refreshGsheets({ API_URL, setGsheetsStatus });
  };

  const handleSendToTelegram = () => {
    sendTableToTelegram({
      selector: ".aosodomoro-table table",
      API_URL: API_URL,
      // target: "group", // for debugging
      target: "channel",
      setTeleStatus,
      title: "Weekly Report AOSODOMORO Non Connectivity",
      subtext:
        "Source: Database NCX\n\nUntuk detail data dapat diakses melalui link berikut:",
      link: "https://rso2telkomdashboard.web.app/reports/aosodomoro",
      dateStr: formatDate(),
    });
  };

  return (
    <div className="table-scroll aosodomoro-table">
      {isAdmin && (
        <div className="filter-container announce">
          <Button
            id="announce-aosodomoro"
            text="Send Telegram"
            iconPath={SVG_PATHS.telegram}
            onClick={handleSendToTelegram}
            backgroundColor="#0088cc"
            iconAfter
            short
          />
          <Button
            id="refresh-gsheets"
            text="Refresh Gsheets"
            onClick={handleRefreshGsheets}
            iconPath={SVG_PATHS.sheets}
            backgroundColor="#34A853"
            iconAfter
            short
          />
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th rowSpan="2">WITEL</th>
              <th colSpan={selectedSubtypes.length}>&lt;3 BLN</th>
              <th rowSpan="2">&lt;3 BLN Total</th>
              <th colSpan={selectedSubtypes.length}>&gt;3 BLN</th>
              <th rowSpan="2">&gt;3 BLN Total</th>
              <th rowSpan="2"> GRAND TOTAL</th>
            </tr>
            <tr>
              {selectedSubtypes.map((st) => (
                <th key={`h1-${st}`}>{st}</th>
              ))}
              {selectedSubtypes.map((st) => (
                <th key={`h2-${st}`}>{st}</th>
              ))}
            </tr>
          </thead>

          <AosodomoroTableBody
            tableData={tableData}
            selectedSegmen={selectedSegmen}
            selectedSubtypes={selectedSubtypes}
            handleCellClick={handleCellClick}
          />
        </table>
      </div>
    </div>
  );
}
