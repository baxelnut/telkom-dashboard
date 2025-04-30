import React, { useState, useEffect } from "react";
import "./ActionSelectedTable.css";
import Dropdown from "../../components/utils/Dropdown";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

const actionOptions = ["Lanjut", "Cancel", "Bukan Order Reg"].map((v) => ({
  value: v,
  label: v,
}));
actionOptions.unshift({ value: null, label: "— Select Action —" });

const formatCurrency = (v) => (v ? `Rp${v.toLocaleString("id-ID")}` : "Rp0");

export default function ActionSelectedTable({
  reportData,
  selectedWitel,
  API_URL,
  userEmail,
  onUpdateSuccess,
  loading,
  error,
}) {
  if (loading) return <Loading backgroundColor="transparent" />;
  if (error) return <Error message={error} />;

  const [actions, setActions] = useState({});
  const [notes, setNotes] = useState({});
  const [inProcessItems, setInProcessItems] = useState([]);

  useEffect(() => {
    const selected = reportData.find(
      (item) => item.witelName === selectedWitel
    );
    if (!selected) return;

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

    setInProcessItems(getInProcessItems());
  }, [selectedWitel, reportData]);

  const headers =
    inProcessItems.length > 0 ? Object.keys(inProcessItems[0]) : [];

  const logLine = (email) => {
    const d = new Date();
    return `Last edited: ${d.toLocaleDateString("id-ID")} ${d
      .toTimeString()
      .slice(0, 5)} by ${email}`;
  };

  return (
    <div className="selected-action-table">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>
                <h6>ACTION</h6>
              </th>
              <th>
                <h6>NOTES</h6>
              </th>
              {headers.map((header, i) => (
                <th key={i}>
                  <h6>{header}</h6>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inProcessItems.map((row, rowIndex) => {
              const currentStatus = actions[row.UUID] ?? row.STATUS ?? "";
              return (
                <tr
                  key={rowIndex}
                  className={`tr-status-${(currentStatus || "no_status")
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  <td>
                    <Dropdown
                      key={`dropdown-${row.UUID}`}
                      options={actionOptions}
                      value={currentStatus}
                      onChange={async (e) => {
                        const val = e.target.value;
                        const newStatus =
                          val === "null" || val === "" ? null : val;

                        setActions((prev) => ({
                          ...prev,
                          [row.UUID]: newStatus,
                        }));

                        const log = logLine(userEmail);
                        try {
                          const res = await fetch(
                            `${API_URL}/regional_3/sheets/${row.UUID}`,
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                STATUS: newStatus,
                                LOG: log,
                              }),
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
                      <h6>
                        {header === "REVENUE"
                          ? formatCurrency(row[header])
                          : row[header] ?? "-"}
                      </h6>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
