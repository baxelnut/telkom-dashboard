import { useState, useEffect, useRef } from "react";
// Style
import "./ActionSelectedTable.css";
// Components
import Dropdown from "../../components/ui/input/Dropdown";
// Helpers
import {
  getStatusColors,
  ACT_OPS,
  getLogLine,
} from "../../helpers/actionBasedUtils";
import { formatCurrency } from "../../helpers/selectedUtils";

export default function ActionSelectedTable({
  reportData,
  API_URL,
  userEmail,
  onUpdateSuccess,
}) {
  const [actions, setActions] = useState({});
  const [notes, setNotes] = useState({});
  const [inProcessItems, setItems] = useState([]);
  const textareaRefs = useRef({});
  const STATUS_COLORS = getStatusColors();

  const headers = inProcessItems.length ? Object.keys(inProcessItems[0]) : [];
  const dropdownOptions = [
    { value: "", label: "— Select Action —" },
    ...ACT_OPS,
  ];

  useEffect(() => {
    setItems(reportData.flatMap((entry) => entry.items || []));
  }, [reportData]);

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

  return (
    <div className="selected-action-table">
      <table>
        <thead>
          <tr>
            <th />
            <th>
              <h6>ACTION</h6>
            </th>
            <th>
              <h6>NOTES</h6>
            </th>
            {headers.map((h, i) => (
              <th key={i}>
                <h6>{h}</h6>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {inProcessItems.map((row, idx) => {
            const uuid = row.UUID;
            const status = actions[uuid] ?? row.STATUS ?? "";
            const currentNote = notes[uuid] ?? row.NOTES ?? "";

            return (
              <tr key={uuid} style={{ backgroundColor: STATUS_COLORS[status] }}>
                <td>{idx + 1}</td>

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

                <td>
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

                {headers.map((h, i) => (
                  <td key={i}>
                    <p className="unresponsive">
                      {h === "REVENUE" ? formatCurrency(row[h]) : row[h] ?? "-"}
                    </p>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
