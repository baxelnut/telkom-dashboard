import React, { useState } from "react";
// Style
import "./AosodomoroTable.css";
// Components
import Button from "../../../components/ui/buttons/Button";
// Context
import { useAuth } from "../../../context/AuthContext";
// Data
import { SVG_PATHS } from "../../../data/utilData";
// Helpers
import { formatDate } from "../../../helpers/formattingUtils";
import { sendTableToTelegram } from "../../../features/bot/sendTableToTelegram";
import {
  renderRowCells,
  renderWitelTotalCells,
  renderReportCells,
  renderGrandTotals,
} from "./aosodomoroRenderers";

export default function AosodomoroTable({
  tableData,
  selectedSegmen,
  selectedSubtypes,
  onCellSelect,
  API_URL,
}) {
  const { isAdmin } = useAuth();
  const [status, setStatus] = useState("");
  const [selectedCell, setSelectedCell] = useState(null);
  const handleCellClick = (celltableData) => {
    setSelectedCell(celltableData);
    onCellSelect(celltableData);
  };

  const handleSendToTelegram = () => {
    sendTableToTelegram({
      selector: ".aosodomoro-table table",
      apiUrl: API_URL,
      target: "channel",
      setStatus,
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
          <p>{status}</p>
          <Button
            id="announce-aosodomoro"
            text="Announce!"
            iconPath={SVG_PATHS.telegram}
            onClick={handleSendToTelegram}
            backgroundColor={"var(--success)"}
            rounded
            iconAfter
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
          <tbody>
            {["AO", "SO", "DO", "MO", "RO"].map((orderType) => (
              <React.Fragment key={orderType}>
                <tr className="aosodomoro-row">
                  <td className="unresponsive">
                    <strong>{orderType}</strong>
                  </td>
                  {renderReportCells(
                    "<",
                    orderType,
                    tableData,
                    selectedSubtypes,
                    selectedSegmen,
                    handleCellClick
                  )}
                  {renderGrandTotals(
                    "<",
                    orderType,
                    tableData,
                    selectedSubtypes,
                    selectedSegmen,
                    handleCellClick
                  )}
                  {renderReportCells(
                    ">",
                    orderType,
                    tableData,
                    selectedSubtypes,
                    selectedSegmen,
                    handleCellClick
                  )}
                  {renderGrandTotals(
                    ">",
                    orderType,
                    tableData,
                    selectedSubtypes,
                    selectedSegmen,
                    handleCellClick
                  )}
                  {renderGrandTotals(
                    "both",
                    orderType,
                    tableData,
                    selectedSubtypes,
                    selectedSegmen,
                    handleCellClick
                  )}
                </tr>

                {tableData.map((entry, index) => (
                  <tr key={entry.witelName || `WITEL_NA_${index}`}>
                    <td className="unresponsive">
                      <strong>
                        {!entry.witelName || entry.witelName === "null"
                          ? "N/A"
                          : entry.witelName}
                      </strong>
                    </td>
                    {renderRowCells(
                      entry,
                      "<",
                      orderType,
                      selectedSubtypes,
                      selectedSegmen,
                      handleCellClick
                    )}
                    {renderWitelTotalCells(
                      entry,
                      "<",
                      orderType,
                      selectedSubtypes,
                      selectedSegmen,
                      handleCellClick
                    )}
                    {renderRowCells(
                      entry,
                      ">",
                      orderType,
                      selectedSubtypes,
                      selectedSegmen,
                      handleCellClick
                    )}
                    {renderWitelTotalCells(
                      entry,
                      ">",
                      orderType,
                      selectedSubtypes,
                      selectedSegmen,
                      handleCellClick
                    )}
                    {renderWitelTotalCells(
                      entry,
                      "both",
                      orderType,
                      selectedSubtypes,
                      selectedSegmen,
                      handleCellClick
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ))}
            <tr className="grand-total-row">
              <td className="unresponsive">
                <strong>GRAND TOTAL</strong>
              </td>
              {renderReportCells(
                "<",
                "ALL",
                tableData,
                selectedSubtypes,
                selectedSegmen,
                handleCellClick
              )}
              {renderGrandTotals(
                "<",
                "ALL",
                tableData,
                selectedSubtypes,
                selectedSegmen,
                handleCellClick
              )}
              {renderReportCells(
                ">",
                "ALL",
                tableData,
                selectedSubtypes,
                selectedSegmen,
                handleCellClick
              )}
              {renderGrandTotals(
                ">",
                "ALL",
                tableData,
                selectedSubtypes,
                selectedSegmen,
                handleCellClick
              )}
              {renderGrandTotals(
                "both",
                "ALL",
                tableData,
                selectedSubtypes,
                selectedSegmen,
                handleCellClick
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
