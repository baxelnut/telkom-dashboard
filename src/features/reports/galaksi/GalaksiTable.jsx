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
} from "../../kpi/galaksiUtils";

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
      target: "group",
      setStatus,
      title: "GALAKSI PO AOSODOMORO Non Conn",
      subtext: "Zero AOSODOMORO > 3 BLN",
      link: "https://rso2telkomdashboard.web.app/report/galaksi",
      dateStr: formatDate(),
    });
  };

  return (
    <div className="galaksi-table">
      {isAdmin && (
        <div className="filter-container">
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
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th rowSpan="2">
                <h6>Project Operation</h6>
              </th>
              <th colSpan={CUSTOM_ORDER.length}>
                <h6>&gt;3 BLN</h6>
              </th>
              <th rowSpan="2">
                <h6>Grand Total</h6>
              </th>
              <th rowSpan="2">
                <h6>Achievement (%)</h6>
              </th>
            </tr>
            <tr>
              {CUSTOM_ORDER.map((type) => (
                <th key={type}>
                  <h6>{type}</h6>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map(({ name, counts }) => (
              <tr key={name}>
                <td>
                  <h6>{name}</h6>
                </td>
                {CUSTOM_ORDER.map((type) => (
                  <td key={type}>
                    <p>{counts[type]}</p>
                  </td>
                ))}
                <td>
                  <p>{counts.total}</p>
                </td>
                <td>
                  <h6>{calculateAchievement(counts.total)}</h6>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>
                <h6>GRAND TOTAL</h6>
              </td>
              {CUSTOM_ORDER.map((type) => (
                <td key={type}>
                  <h6>{grandTotal[type]}</h6>
                </td>
              ))}
              <td>
                <h6>{grandTotal.total}</h6>
              </td>
              <td className="filler"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
