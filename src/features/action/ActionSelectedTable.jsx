import React, { useState } from "react";
import "./ActionSelectedTable.css";
import Dropdown from "../../components/utils/Dropdown";
import Error from "../../components/utils/Error";

const actionOptions = ["Lanjut", "Cancel", "Bukan Order Reg"].map((v) => ({
  value: v,
  label: v,
}));
actionOptions.unshift({ value: "", label: "— Select Action —" });

const formatCurrency = (v) => (v ? `Rp${v.toLocaleString("id-ID")}` : "Rp0");

export default function ActionSelectedTable({
  reportData,
  selectedWitel,
  API_URL,
  userEmail,
  onUpdateSuccess,
}) {
  const [actions, setActions] = useState({});
  const [notes, setNotes] = useState({});

  const selected = reportData.find((item) => item.witelName === selectedWitel);
  if (!selected)
    return <Error message={`No data found for ${selectedWitel}`} />;

  const logLine = (email) => {
    const d = new Date();
    return `Last edited: ${d.toLocaleDateString("id-ID")} ${d
      .toTimeString()
      .slice(0, 5)} by ${email}`;
  };

  const getInProcessItems = () => {
    let result = [];
    for (const [subType, bucket] of Object.entries(selected)) {
      if (subType === "witelName") continue;

      const under3bln = bucket["<3blnItems"] || [];
      const over3bln = bucket[">3blnItems"] || [];

      const combined = [...under3bln, ...over3bln].filter(
        (item) => item.KATEGORI === "IN PROCESS"
      );
      result.push(...combined);
    }
    return result;
  };

  const inProcessItems = getInProcessItems();
  const headers =
    inProcessItems.length > 0 ? Object.keys(inProcessItems[0]) : [];

  return (
    <div className="selected-action-table">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>ACTION</th>
              <th>NOTES</th>
              {headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inProcessItems.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`tr-status-${(
                  actions[row.UUID] ??
                  row.STATUS ??
                  "no_status"
                )
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                <td>
                  <Dropdown
                    key={`dropdown-${row.UUID}`}
                    options={actionOptions}
                    value={actions[row.UUID] ?? row.STATUS ?? ""}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setActions((prev) => ({ ...prev, [row.UUID]: val }));
                      const log = logLine(userEmail);
                      try {
                        const res = await fetch(
                          `${API_URL}/regional_3/sheets/${row.UUID}`,
                          {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ STATUS: val, LOG: log }),
                          }
                        );
                        if (!res.ok) throw new Error("Update failed");
                        onUpdateSuccess?.();
                      } catch (err) {
                        console.error("❌ Failed to update STATUS:", err);
                      }
                    }}
                  />
                </td>
                <td>
                  <textarea
                    className="notes"
                    value={notes[row.UUID] ?? row.NOTES ?? ""}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setNotes((prev) => ({ ...prev, [row.UUID]: val }));
                      const log = logLine(userEmail);
                      try {
                        const res = await fetch(
                          `${API_URL}/regional_3/sheets/${row.UUID}`,
                          {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              NOTES: val.trim() || null,
                              LOG: log,
                            }),
                          }
                        );
                        if (!res.ok) throw new Error("Notes update failed");
                        onUpdateSuccess?.();
                      } catch (err) {
                        console.error("❌ Failed to update NOTES:", err);
                      }
                    }}
                    rows={1}
                  />
                </td>
                {headers.map((header, i) => (
                  <td key={i}>
                    {header === "REVENUE"
                      ? formatCurrency(row[header])
                      : row[header] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
