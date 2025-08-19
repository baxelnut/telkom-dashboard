import { useState, useEffect, useRef } from "react";
// Style
import "./ActionSelectedTable.css";
// Components
import Dropdown from "../../components/ui/input/Dropdown";
import Icon from "../../components/ui/icons/Icon";
// Data
import { SVG_PATHS } from "../../data/utilsData";
// Helpers
import { hiddenCols } from "../../helpers/tableHelper";
import { formatCurrency } from "../../helpers/formattingUtils";
import {
  getStatusColors,
  ACT_OPS,
  getLogLine,
} from "../../helpers/actionBasedUtils";

export default function ActionSelectedTable({
  API_URL,
  reportData,
  userEmail,
  onUpdateSuccess,
  isAdmin,
  bucket, // "<" or ">"
  onAlertCountsChange,
  alertFilter,
}) {
  const [actions, setActions] = useState({});
  const [notes, setNotes] = useState({});
  const [inProcessItems, setItems] = useState([]);
  const textareaRefs = useRef({});
  const STATUS_COLORS = getStatusColors();

  // Filter out hidden columns for non-admins
  const headers = inProcessItems.length
    ? Object.keys(inProcessItems[0]).filter(
        (col) => isAdmin || !hiddenCols.includes(col)
      )
    : [];

  const dropdownOptions = [
    { value: "", label: "— Select Action —" },
    ...ACT_OPS,
  ];

  useEffect(() => {
    // Flatten and filter items by bucket; if bucket is falsy, include all buckets (selected view)
    const items = reportData
      .flatMap((entry) => entry.items || [])
      .filter((item) => (bucket ? item._bucket === bucket : true)); // include all when bucket is undefined

    // compute alert counts (only for rows that show the ALERT column: !isOver90)
    const alertRows = items.filter((item) => !item.isOver90);
    const segeraCount = alertRows.filter((item) => !!item.isWarning).length; // warning => Segera Diproses
    const amanCount = alertRows.filter((item) => !item.isWarning).length; // safe => Aman

    // lift the numbers up if parent wants them
    if (typeof onAlertCountsChange === "function") {
      onAlertCountsChange({ aman: amanCount, segera: segeraCount });
    }

    // apply alertFilter AFTER counts (counts are totals for the bucket)
    const filteredItems = items.filter((item) => {
      if (!alertFilter || alertFilter === "ALL") return true;
      if (alertFilter === "Aman") return !item.isWarning && !item.isOver90;
      if (alertFilter === "Segera Diproses")
        return item.isWarning && !item.isOver90;
      return true;
    });

    setItems(filteredItems); // set filtered items once
  }, [reportData, bucket, onAlertCountsChange, alertFilter]);

  useEffect(() => {
    inProcessItems.forEach(({ UUID }) => {
      const ref = textareaRefs.current[UUID];
      if (ref) {
        ref.style.height = "auto";
        ref.style.height = `${ref.scrollHeight}px`;
      }
    });
  }, [inProcessItems, notes]);

  const patchRow = async (uuid, payload) => {
    try {
      const res = await fetch(`${API_URL}/regional-3/sheets/${uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
      onUpdateSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  const showAlertColumn = inProcessItems.some((row) => !row.isOver90);

  return (
    <div className="selected-action-table">
      {inProcessItems.length === 0 ? (
        <p className="no-data">No data.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{/* Numbers */}</th>
              <th>ACTION</th>
              <th>NOTES</th>
              {showAlertColumn && <th>ALERT</th>}
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inProcessItems.map((row, idx) => {
              const uuid = row.UUID;
              const status = actions[uuid] ?? row.STATUS ?? "";
              const currentNote = notes[uuid] ?? row.NOTES ?? "";
              const isWarning = !!row.isWarning; // Decide if it's in warning zone (60 > x > 90 days)

              return (
                <tr
                  key={uuid}
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                >
                  <td>{idx + 1}</td>

                  {/* ACTION dropdown */}
                  <td className="action-cell">
                    <Dropdown
                      options={dropdownOptions}
                      value={status}
                      onChange={async (e) => {
                        const newStatus = e.target.value || "";
                        setActions((prev) => ({ ...prev, [uuid]: newStatus }));
                        await patchRow(uuid, {
                          STATUS: newStatus,
                          LOG: getLogLine(userEmail),
                        });
                      }}
                      chevronDown
                      fullWidth
                    />
                  </td>

                  {/* NOTES textarea */}
                  <td className="action-cell">
                    <textarea
                      ref={(el) => (textareaRefs.current[uuid] = el)}
                      className="notes"
                      value={currentNote}
                      rows={1}
                      onChange={async (e) => {
                        const val = e.target.value;
                        const el = e.target;
                        el.style.height = "auto";
                        el.style.height = `${el.scrollHeight}px`;
                        setNotes((prev) => ({ ...prev, [uuid]: val }));
                        await patchRow(uuid, {
                          NOTES: val.trim() || " ",
                          LOG: getLogLine(userEmail),
                        });
                      }}
                    />
                  </td>

                  {/* ALERT column */}
                  {showAlertColumn && !row.isOver90 && (
                    <td>
                      <div className="alert-container">
                        <Icon
                          path={
                            isWarning ? SVG_PATHS.error : SVG_PATHS.checkSquare
                          }
                          fill={isWarning ? "var(--danger)" : "var(--text)"}
                          size={18}
                        />
                        <p
                          style={{
                            color: isWarning ? "var(--danger)" : "var(--text)",
                            fontWeight: isWarning ? "600" : "400",
                          }}
                        >
                          {isWarning ? "Segera Diproses" : "Aman"}
                        </p>
                      </div>
                    </td>
                  )}

                  {/* Data columns */}
                  {headers.map((h, i) => (
                    <td key={i} className="unresponsive data-col">
                      <p>
                        {h === "REVENUE"
                          ? formatCurrency(row[h])
                          : row[h] ?? "-"}
                      </p>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
