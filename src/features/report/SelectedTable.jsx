import React, { useState } from "react";
import "./SelectedTable.css";
import Dropdown from "../../components/utils/Dropdown";

const actionOptions = [" ", "Lanjut", "Cancel", "Bukan Order Reg"].map(
  (value) => ({
    value,
    label: value,
  })
);

const formatCurrency = (value) =>
  value ? `Rp${value.toLocaleString("id-ID")}` : "Rp0";

export default function SelectedTable({
  selectedCell,
  data,
  selectedCategory,
}) {
  if (!selectedCell) {
    return (
      <div>
        <p>No data available for selection.</p>
      </div>
    );
  }

  const [selectedActions, setSelectedActions] = useState({});
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
      (selectedCategory === "ALL" || item.order_subtype === selectedCategory)
  );

  if (filteredItems.length === 0) {
    return (
      <div>
        <p>No matching data found.</p>
      </div>
    );
  }

  const hasInProgress = filteredItems.some(
    (item) => item.kategori === "IN PROCESS"
  );

  return (
    <div className="selected-table">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {hasInProgress && (
                <th style={{ textAlign: "center" }}>
                  <h6>Action</h6>
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
              const isInProgress = item.kategori === "IN PROCESS";

              return (
                <tr key={rowIndex}>
                  {hasInProgress && (
                    <td>
                      {isInProgress && (
                        <Dropdown
                          key={item.id}
                          options={actionOptions}
                          value={selectedActions[item.id] || " "}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setSelectedActions((prev) => ({
                              ...prev,
                              [item.id]: newValue,
                            }));
                            console.log(
                              "ID:",
                              item.id,
                              ", is now changed status to:",
                              newValue
                            );
                          }}
                        />
                      )}
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
