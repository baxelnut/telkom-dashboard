import { useState } from "react";
// /Style
import "./GalaksiTable.css";
// Components
import AchExplanation from "../../../features/reports/galaksi/AchExplaination";
import Button from "../../../components/ui/buttons/Button";
// Context
import { useAuth } from "../../../context/AuthContext";
// Data
import { SVG_PATHS } from "../../../data/utilsData";
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
import { sendAlertToTelegram } from "../../bot/sendAlertToTelegram";

export default function GalaksiTable({ achData = [], poData = [], API_URL }) {
  const { isAdmin } = useAuth();
  const [teleStatus, setTeleStatus] = useState(null);
  const [alertStatus, setAlertStatus] = useState(null);

  const achMap = mapAchievementData(achData, CUSTOM_ORDER);
  const tableRows = buildTableRows(poData, achMap, CUSTOM_ORDER);
  const grandTotal = calculateGrandTotal(tableRows, CUSTOM_ORDER);

  const handleSendToTelegram = async () => {
    console.log("firing sendTableToTelegram");
    await sendTableToTelegram({
      selector: ".galaksi-table table",
      API_URL: API_URL,
      // target: "group", // for debugging
      target: "channel",
      setTeleStatus,
      title: "GALAKSI PO AOSODOMORO Non Conn",
      subtext: "Zero AOSODOMORO > 3 BLN",
      link: "https://rso2telkomdashboard.web.app/reports/galaksi",
      dateStr: formatDate(),
    });
  };

  const handleSendAlert = async () => {
    console.log("firing sendAlertToTelegram");
    await sendAlertToTelegram({ API_URL, setStatus: setAlertStatus });
  };

  return (
    <div className="galaksi-table">
      {isAdmin && (
        <div className="filter-container announce">
          <Button
            id="announce-galaksi"
            text={teleStatus ?? "Send Table"}
            iconPath={SVG_PATHS.telegram}
            onClick={handleSendToTelegram}
            backgroundColor="#0088cc"
            iconAfter
            short
          />
          <Button
            id="pic-alert"
            text={alertStatus ?? "Send PIC Alert"}
            iconPath={SVG_PATHS.telegram}
            onClick={handleSendAlert}
            backgroundColor="orange"
            iconAfter
            short
          />
        </div>
      )}
      <AchExplanation />

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
