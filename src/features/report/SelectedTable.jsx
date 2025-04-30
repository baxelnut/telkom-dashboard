import React, { useState } from "react";
import "./SelectedTable.css";
import Dropdown from "../../components/utils/Dropdown";
import Error from "../../components/utils/Error";

const actionOptions = ["Lanjut", "Cancel", "Bukan Order Reg"].map((v) => ({
  value: v,
  label: v,
}));
actionOptions.unshift({ value: " ", label: "— Select Action —" });

const formatCurrency = (v) => (v ? `Rp${v.toLocaleString("id-ID")}` : "Rp0");

export default function SelectedTable({
  selectedCell,
  data,
  selectedCategory,
  API_URL,
  userEmail,
  onUpdateSuccess,
}) {
  if (!selectedCell) return <Error />;
  const { witelName, kategoriUmur, isTotal, extractedIds, subType, subTypes } =
    selectedCell;

  const [actions, setActions] = useState({});
  const [notes, setNotes] = useState({});

  const bucketKeys = (() => {
    if (witelName === "ALL" && isTotal && subType == null) {
      return ["<3blnItems", ">3blnItems"];
    }

    return [`${kategoriUmur}Items`];
  })();

  let items = [];

  if (witelName === "ALL") {
    if (subType) {
      data.forEach((ent) =>
        bucketKeys.forEach((bk) => items.push(...(ent[subType]?.[bk] || [])))
      );
    } else {
      data.forEach((ent) =>
        subTypes.forEach((st) =>
          bucketKeys.forEach((bk) => items.push(...(ent[st]?.[bk] || [])))
        )
      );
    }
  } else {
    const ent = data.find((d) => d.witelName === witelName);
    if (!ent) return <p>No data for {witelName}</p>;

    if (isTotal) {
      subTypes.forEach((st) =>
        bucketKeys.forEach((bk) => items.push(...(ent[st]?.[bk] || [])))
      );
    } else {
      items = ent[subType]?.[bucketKeys[0]] || [];
    }
  }

  const filtered = items.filter(
    (i) =>
      extractedIds.includes(i.id) &&
      (selectedCategory === "ALL" || i.ORDER_SUBTYPE2 === selectedCategory)
  );

  if (!filtered.length) return <p>No matching data found.</p>;

  const hasInProgress = filtered.some((i) => i.KATEGORI === "IN PROCESS");

  const logLine = (email) => {
    const d = new Date();
    return `Last edited: ${d.toLocaleDateString("id-ID")} ${d
      .toTimeString()
      .slice(0, 5)} by ${email}`;
  };

  return (
    <div className="selected-table">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {hasInProgress && (
                <th>
                  <h6>ACTION</h6>
                </th>
              )}
              {hasInProgress && (
                <th>
                  <h6>NOTES</h6>
                </th>
              )}
              {Object.keys(filtered[0]).map((c) => (
                <th key={c}>
                  <h6>{c}</h6>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((itm, idx) => {
              const inProg = itm.KATEGORI === "IN PROCESS";
              return (
                <tr
                  key={idx}
                  className={`tr-status-${(
                    actions[itm.UUID] ??
                    itm.STATUS ??
                    "no_status"
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {hasInProgress && (
                    <td>
                      {inProg && (
                        <Dropdown
                          key={itm.UUID}
                          options={actionOptions}
                          value={actions[itm.UUID] ?? itm.STATUS ?? ""}
                          onChange={async (e) => {
                            const val = e.target.value;
                            setActions((p) => ({ ...p, [itm.UUID]: val }));
                            const log = logLine(userEmail);
                            await fetch(
                              `${API_URL}/regional_3/sheets/${itm.UUID}`,
                              {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ STATUS: val, LOG: log }),
                              }
                            ).then((res) =>
                              res.ok ? onUpdateSuccess() : Promise.reject()
                            );
                          }}
                        />
                      )}
                    </td>
                  )}
                  {hasInProgress && (
                    <td>
                      {inProg && (
                        <textarea
                          className="notes"
                          value={notes[itm.UUID] ?? itm.NOTES ?? ""}
                          onChange={async (e) => {
                            const txt = e.target.value;
                            setNotes((p) => ({ ...p, [itm.UUID]: txt }));
                            const log = logLine(userEmail);
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
                            ).then((res) =>
                              res.ok ? onUpdateSuccess() : Promise.reject()
                            );
                          }}
                          rows={1}
                        />
                      )}
                    </td>
                  )}
                  {Object.keys(itm).map((c) => (
                    <td key={c}>
                      {c === "REVENUE" ? formatCurrency(itm[c]) : itm[c] ?? "-"}
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
