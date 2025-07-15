import { useState, useEffect, useRef } from "react";
// Style
import "./ActionSelectedTable.css";
// Components
import Dropdown from "../../components/ui/input/Dropdown";

const actionOptions = ["Lanjut", "Cancel", "Bukan Order Reg"].map((v) => ({
  value: v,
  label: v,
}));
actionOptions.unshift({ value: " ", label: "— Select Action —" });

const formatCurrency = (v) => (v ? `Rp${v.toLocaleString("id-ID")}` : "Rp0");

export default function ActionSelectedTable({
  reportData,
  API_URL,
  userEmail,
  onUpdateSuccess,
}) {
  const [actions, setActions] = useState({});
  const [notes, setNotes] = useState({});
  const [inProcessItems, setItems] = useState([]);

  useEffect(() => {
    const all = reportData.flatMap((entry) => entry.items || []);
    setItems(all);
  }, [reportData]);

  const headers = inProcessItems.length ? Object.keys(inProcessItems[0]) : [];

  const logLine = (email) => {
    const d = new Date();
    return `Last edited: ${d.toLocaleDateString("id-ID")} ${d
      .toTimeString()
      .slice(0, 5)} by ${email}`;
  };

  const textareaRefs = useRef({});

  useEffect(() => {
    inProcessItems.forEach((row) => {
      const uuid = row.UUID;
      const ref = textareaRefs.current[uuid];
      if (ref) {
        ref.style.height = "auto";
        ref.style.height = `${ref.scrollHeight}px`;
      }
    });
  }, [inProcessItems, notes]);

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
            const currentStatus = actions[uuid] ?? row.STATUS ?? "";

            return (
              <tr
                key={uuid}
                className={`tr-status-${(currentStatus || "no_status")
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                <td>{idx + 1}</td>

                {/* ACTION dropdown */}
                <td className="action-cell">
                  <Dropdown
                    options={actionOptions}
                    value={currentStatus}
                    onChange={async (e) => {
                      const val = e.target.value;
                      const newStatus = val ? val : null;
                      setActions((p) => ({ ...p, [uuid]: newStatus }));
                      const log = logLine(userEmail);
                      await fetch(`${API_URL}/regional-3/sheets/${uuid}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ STATUS: newStatus, LOG: log }),
                      })
                        .then((res) => {
                          if (!res.ok) throw new Error("Update failed");
                          onUpdateSuccess();
                        })
                        .catch(console.error);
                    }}
                    chevronDown
                    fullWidth
                  />
                </td>

                {/* NOTES textarea */}
                <td>
                  <textarea
                    ref={(el) => (textareaRefs.current[uuid] = el)}
                    className="notes"
                    value={notes[uuid] ?? row.NOTES ?? ""}
                    rows={1}
                    onChange={async (e) => {
                      const val = e.target.value;

                      const textarea = e.target;
                      textarea.style.height = "auto";
                      textarea.style.height = `${textarea.scrollHeight}px`;

                      setNotes((p) => ({ ...p, [uuid]: val }));

                      const log = logLine(userEmail);
                      await fetch(`${API_URL}/regional-3/sheets/${uuid}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          NOTES: val.trim() || " ",
                          LOG: log,
                        }),
                      })
                        .then((res) => {
                          if (!res.ok) throw new Error("Notes update failed");
                          onUpdateSuccess();
                        })
                        .catch(console.error);
                    }}
                  />
                </td>

                {/* all other columns */}
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
