import React, { useState } from "react";
import "./SelectedTable.css";
import Dropdown from "../../components/utils/Dropdown";
import Error from "../../components/utils/Error";

const actionOptions = ["Lanjut", "Cancel", "Bukan Order Reg"].map((v) => ({
  value: v,
  label: v,
}));
actionOptions.unshift({ value: " ", label: "— Select Action —" });

const formatCurrency = (val) =>
  val ? `Rp${val.toLocaleString("id-ID")}` : "Rp0";

export default function SelectedTable({
  selectedCell,
  data,
  selectedCategory,
  API_URL,
  userEmail,
  onUpdateSuccess,
}) {
  if (!selectedCell) return <Error />;

  const [selectedActions, setSelectedActions] = useState({});
  const [notes, setNotes] = useState({});

  const { witelName, kategoriUmur, isTotal, extractedIds, subTypes, subType } =
    selectedCell;

  const witelEntry = data.find((d) => d.witelName === witelName);
  if (!witelEntry) return <p>No matching data found.</p>;

  const bucketKeys = isTotal
    ? ["<3blnItems", ">3blnItems"]
    : [`${kategoriUmur}Items`];

  let items = [];
  if (isTotal) {
    subTypes.forEach((st) => {
      bucketKeys.forEach((bk) => {
        items.push(...(witelEntry[st]?.[bk] || []));
      });
    });
  } else {
    items = witelEntry[subType]?.[bucketKeys[0]] || [];
  }

  const filteredItems = items.filter(
    (itm) =>
      extractedIds.includes(itm.id) &&
      (selectedCategory === "ALL" || itm.ORDER_SUBTYPE === selectedCategory)
  );

  if (filteredItems.length === 0) {
    return <p>No matching data found.</p>;
  }

  const hasInProgress = filteredItems.some(
    (itm) => itm.KATEGORI === "IN PROCESS"
  );

  const generateLog = (email) => {
    const now = new Date();
    const date = now.toLocaleDateString("id-ID");
    const time = now.toTimeString().slice(0, 5);
    return `Last edited: ${date} ${time} by ${email}`;
  };

  return (
    <div className="selected-table">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {hasInProgress && (
                <th>
                  <h6>Log</h6>
                </th>
              )}
              {hasInProgress && (
                <th>
                  <h6>Action</h6>
                </th>
              )}
              {hasInProgress && (
                <th>
                  <h6>Notes</h6>
                </th>
              )}
              {Object.keys(filteredItems[0]).map((col) => (
                <th key={col}>
                  <h6>{col}</h6>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((itm, idx) => {
              const inProg = itm.KATEGORI === "IN PROCESS";
              return (
                <tr key={idx}>
                  {hasInProgress && (
                    <td>
                      <p>{itm.LOG || ""}</p>
                    </td>
                  )}

                  {hasInProgress && (
                    <td>
                      {inProg && (
                        <Dropdown
                          key={itm.UUID}
                          options={actionOptions}
                          value={selectedActions[itm.UUID] ?? itm.STATUS ?? ""}
                          onChange={async (e) => {
                            const val = e.target.value;
                            setSelectedActions((p) => ({
                              ...p,
                              [itm.UUID]: val,
                            }));
                            const log = generateLog(userEmail);
                            await fetch(
                              `${API_URL}/regional_3/sheets/${itm.UUID}`,
                              {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ STATUS: val, LOG: log }),
                              }
                            )
                              .then((res) => {
                                if (!res.ok) throw new Error("Failed");
                                onUpdateSuccess();
                              })
                              .catch(console.error);
                          }}
                        />
                      )}
                    </td>
                  )}

                  {hasInProgress && (
                    <td>
                      <textarea
                        className="notes"
                        value={notes[itm.UUID] ?? itm.NOTES ?? ""}
                        onChange={async (e) => {
                          const txt = e.target.value;
                          setNotes((p) => ({ ...p, [itm.UUID]: txt }));
                          const log = generateLog(userEmail);
                          await fetch(
                            `${API_URL}/regional_3/sheets/${itm.UUID}`,
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                NOTES: txt.trim() || null,
                                LOG: log,
                              }),
                            }
                          )
                            .then((res) => {
                              if (!res.ok) throw new Error("Failed");
                              onUpdateSuccess();
                            })
                            .catch(console.error);
                        }}
                        rows={1}
                      />
                    </td>
                  )}

                  {Object.keys(itm).map((col) => (
                    <td key={col}>
                      <p>
                        {col === "REVENUE"
                          ? formatCurrency(itm[col])
                          : itm[col] ?? "-"}
                      </p>
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
