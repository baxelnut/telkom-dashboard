import React, { useState } from "react";
import "./SelectedTable.css";
import Dropdown from "../../components/utils/Dropdown";
import Error from "../../components/utils/Error";

const actionOptions = ["Lanjut", "Cancel", "Bukan Order Reg"].map((value) => ({
  value,
  label: value,
}));
actionOptions.unshift({ value: " ", label: "— Select Action —" });

const formatCurrency = (value) =>
  value ? `Rp${value.toLocaleString("id-ID")}` : "Rp0";

export default function SelectedTable({
  selectedCell,
  data,
  selectedCategory,
  API_URL,
  userEmail,
  onUpdateSuccess,
}) {
  if (!selectedCell) {
    return <Error />;
  }

  const [selectedActions, setSelectedActions] = useState({});
  const [notes, setNotes] = useState({});
  const { extractedIds, witelName, subType, kategoriUmur } = selectedCell;

  const foundItem = data.find(
    (item) =>
      item.witelName === witelName &&
      item[subType] &&
      item[subType][`${kategoriUmur}Items`]
  );

  if (!foundItem) {
    return (
      <div>
        <p>No matching data found.</p>
      </div>
    );
  }

  const items = foundItem[subType][`${kategoriUmur}Items`] || [];

  const filteredItems = items.filter(
    (item) =>
      extractedIds.includes(item.id) &&
      (selectedCategory === "ALL" || item["ORDER_SUBTYPE"] === selectedCategory)
  );

  if (filteredItems.length === 0) {
    return (
      <div>
        <p>No matching data found.</p>
      </div>
    );
  }

  const hasInProgress = filteredItems.some(
    (item) => item["KATEGORI"] === "IN PROCESS"
  );

  const generateLog = (email) => {
    const now = new Date().toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });
    return `Last edited: ${now} by ${email}`;
  };

  return (
    <div className="selected-table">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {hasInProgress && (
                <th style={{ textAlign: "center" }}>
                  <h6>Log</h6>
                </th>
              )}
              {hasInProgress && (
                <th style={{ textAlign: "center" }}>
                  <h6>Action</h6>
                </th>
              )}
              {hasInProgress && (
                <th style={{ textAlign: "center" }}>
                  <h6>Notes</h6>
                </th>
              )}
              {Object.keys(filteredItems[0]).map((key) => (
                <th key={key}>
                  <h6>{key}</h6>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, rowIndex) => {
              const isInProgress = item["KATEGORI"] === "IN PROCESS";

              return (
                <tr key={rowIndex}>
                  {item.LOG !== undefined && (
                    <td>
                      <p>{item.LOG || " "}</p>
                    </td>
                  )}
                  {hasInProgress && (
                    <td>
                      {isInProgress && (
                        <Dropdown
                          key={item.UUID}
                          options={actionOptions}
                          value={
                            selectedActions[item.UUID] ?? item["STATUS"] ?? " "
                          }
                          onChange={async (e) => {
                            const newValue = e.target.value;

                            setSelectedActions((prev) => ({
                              ...prev,
                              [item.UUID]: newValue,
                            }));

                            const log = generateLog(userEmail);

                            try {
                              const res = await fetch(
                                `${API_URL}/regional_3/sheet/${item.UUID}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    STATUS: newValue,
                                    LOG: log,
                                  }),
                                }
                              );

                              if (!res.ok) {
                                throw new Error("Failed to update status");
                              }

                              onUpdateSuccess?.();
                            } catch (err) {
                              console.error("Error updating status:", err);
                            }
                          }}
                        />
                      )}
                    </td>
                  )}
                  {hasInProgress && (
                    <td className="notes-container">
                      <textarea
                        className="notes"
                        value={notes[item.UUID] ?? item["NOTES"] ?? " "}
                        onChange={async (e) => {
                          const updatedNotes = e.target.value;

                          setNotes((prev) => ({
                            ...prev,
                            [item.UUID]: updatedNotes,
                          }));

                          const log = generateLog(userEmail);

                          try {
                            const res = await fetch(
                              `${API_URL}/regional_3/sheet/${item.UUID}`,
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  NOTES:
                                    updatedNotes.trim() === ""
                                      ? null
                                      : updatedNotes,
                                  LOG: log,
                                }),
                              }
                            );

                            if (!res.ok) {
                              throw new Error("Failed to update notes");
                            }

                            onUpdateSuccess?.();
                          } catch (err) {
                            console.error("Error updating notes:", err);
                          }
                        }}
                        rows={1}
                      />
                    </td>
                  )}

                  {Object.keys(item).map((key) => (
                    <td key={key}>
                      <p>
                        {key === "revenue"
                          ? formatCurrency(item[key])
                          : item[key] !== null
                          ? item[key].toString()
                          : "-"}
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
