import React, { useState } from "react";
// Style
import "./AosodomoroTable.css";
// Components
import Button from "../../../components/ui/buttons/Button";
// Context
import { useAuth } from "../../../context/AuthContext";
// Data
import { SVG_PATHS } from "../../../data/utilsData";
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
  API_URL,
  tableData,
  selectedSegmen,
  selectedSubtypes,
  onCellSelect,
}) {
  const { isAdmin } = useAuth();
  const [teleStatus, setTeleStatus] = useState(null);
  const [gsheetStatus, setGsheetsStatus] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  const handleCellClick = (celltableData) => {
    setSelectedCell(celltableData);
    onCellSelect(celltableData);
  };

  const handleSendToTelegram = () => {
    sendTableToTelegram({
      selector: ".aosodomoro-table table",
      apiUrl: API_URL,
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

  const handleRefreshGsheets = async () => {
    try {
      setGsheetsStatus("Refreshing GSheets...");
      // Build API base:
      const url = `${API_URL}/gas/push`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // optionally forward some context to server/GAS; keep minimal
        body: JSON.stringify({
          meta: {
            triggeredBy: "frontend",
            timestamp: new Date().toISOString(),
          },
        }),
      });
      // network-level failure will throw above
      const text = await resp.text();
      // Try parse JSON body
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (err) {
        // Not JSON — show raw snippet for debugging
        setGsheetsStatus("GSheets: unexpected response (see console)");
        console.error("Non-JSON response from /api/gas/push:", text);
        return;
      }
      if (!resp.ok || !data?.ok) {
        const errorMsg = data?.error || `HTTP ${resp.status}`;
        setGsheetsStatus(`GSheets Error: ${errorMsg}`);
        console.error("GSheets error detail:", data);
        return;
      }
      setGsheetsStatus("GSheets refresh triggered");
      console.log("GAS response:", data);
    } catch (err) {
      console.error("Fetch error", err);
      setGsheetsStatus("Failed to refresh GSheets");
    } finally {
      // clear status after 10s so UI returns to normal
      setTimeout(() => setGsheetsStatus(""), 10000);
    }
  };

  return (
    <div className="table-scroll aosodomoro-table">
      {isAdmin && (
        <div className="filter-container announce">
          <Button
            id="announce-aosodomoro"
            text={teleStatus ?? "Announce Telegram"}
            iconPath={SVG_PATHS.telegram}
            onClick={handleSendToTelegram}
            backgroundColor="#0088cc"
            iconAfter
            short
          />

          {/* <Button
            id="refresh-gsheets"
            text={gsheetStatus ?? "Refresh Gsheets"}
            onClick={handleRefreshGsheets}
            iconPath={SVG_PATHS.sheets}
            backgroundColor="#34A853"
            iconAfter
            short
          /> */}
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
