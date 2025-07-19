import { useState } from "react";
// /Style
import "./GalaksiTable.css";
// Components
import Button from "../../../components/ui/buttons/Button";
// Context
import { useAuth } from "../../../context/AuthContext";
// Data
import { SVG_PATHS } from "../../../data/utilData";
// Helpers
import { CUSTOM_ORDER } from "../../../helpers/overviewUtils";
import { sendTableToTelegram } from "../../bot/sendTableToTelegram";
import { formatDate } from "../../../helpers/formattingUtils";
import {
  mapAchievementData,
  buildTableRows,
  calculateAchievement,
  calculateGrandTotal,
} from "../../kpis/galaksiUtils";

export default function GalaksiTable({ achData = [], poData = [], API_URL }) {
  const { isAdmin } = useAuth();
  const [status, setStatus] = useState("");

  const achMap = mapAchievementData(achData, CUSTOM_ORDER);
  const tableRows = buildTableRows(poData, achMap, CUSTOM_ORDER);
  const grandTotal = calculateGrandTotal(tableRows, CUSTOM_ORDER);

  const handleSendToTelegram = () => {
    sendTableToTelegram({
      selector: ".galaksi-table table",
      apiUrl: API_URL,
      target: "channel",
      setStatus,
      title: "GALAKSI PO AOSODOMORO Non Conn",
      subtext: "Zero AOSODOMORO > 3 BLN",
      link: "https://rso2telkomdashboard.web.app/reports/galaksi",
      dateStr: formatDate(),
    });
  };

  return (
    <div className="galaksi-table">
      {isAdmin && (
        <div className="filter-container announce">
          <p>{status}</p>
          <Button
            id="announce-galaksi"
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
              <th rowSpan="2">Project Operation</th>
              <th colSpan={CUSTOM_ORDER.length}>&gt;3 BLN</th>
              <th rowSpan="2">Grand Total</th>
              <th rowSpan="2">Achievement (%)</th>
            </tr>
            <tr>
              {CUSTOM_ORDER.map((type) => (
                <th key={type}>{type}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map(({ name, counts }) => (
              <tr key={name}>
                <td className="po-name">
                  <strong>{name}</strong>
                </td>
                {CUSTOM_ORDER.map((type) => (
                  <td key={type}>{counts[type]}</td>
                ))}
                <td>{counts.total}</td>
                <td>
                  <strong>{calculateAchievement(counts.total)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="grand-t">
                <strong>GRAND TOTAL</strong>
              </td>
              {CUSTOM_ORDER.map((type) => (
                <td key={type}>
                  <strong>{grandTotal[type]}</strong>
                </td>
              ))}
              <td>
                <strong>{grandTotal.total}</strong>
              </td>
              <td className="filler"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
