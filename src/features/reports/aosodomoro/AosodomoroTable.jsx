import React, { useState } from "react";
// Style
import "./AosodomoroTable.css";
// Helpers
import {
  renderRowCells,
  renderWitelTotalCells,
  renderReportCells,
  renderGrandTotals,
} from "../../../helpers/aosodomoroRenderers";

export default function AosodomoroTable({
  tableData,
  selectedSegmen,
  selectedSubtypes,
  onCellSelect,
}) {
  const [selectedCell, setSelectedCell] = useState(null);
  const handleCellClick = (celltableData) => {
    setSelectedCell(celltableData);
    onCellSelect(celltableData);
  };

  return (
    <div className="table-scroll aosodomoro-table">
      <table>
        <thead>
          <tr>
            <th rowSpan="2">
              <h6>WITEL</h6>
            </th>
            <th colSpan={selectedSubtypes.length}>
              <h6>&lt;3 BLN</h6>
            </th>
            <th rowSpan="2">
              <h6>&lt;3 BLN Total</h6>
            </th>
            <th colSpan={selectedSubtypes.length}>
              <h6>&gt;3 BLN</h6>
            </th>
            <th rowSpan="2">
              <h6>&gt;3 BLN Total</h6>
            </th>
            <th rowSpan="2">
              <h6>GRAND TOTAL</h6>
            </th>
          </tr>
          <tr>
            {selectedSubtypes.map((st) => (
              <th key={`h1-${st}`}>
                <h6>{st}</h6>
              </th>
            ))}
            {selectedSubtypes.map((st) => (
              <th key={`h2-${st}`}>
                <h6>{st}</h6>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {["AO", "SO", "DO", "MO", "RO"].map((orderType) => (
            <React.Fragment key={orderType}>
              <tr className="aosodomoro-row">
                <td className="unresponsive">
                  <h6>{orderType}</h6>
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
                    <h6>
                      {!entry.witelName || entry.witelName === "null"
                        ? "N/A"
                        : entry.witelName}
                    </h6>
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
              <h6>GRAND TOTAL</h6>
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
  );
}
