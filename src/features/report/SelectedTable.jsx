import React from "react";
import "./SelectedTable.css";

export default function SelectedTable({
  selectedCell,
  data,
  selectedCategory,
}) {
  if (!selectedCell) {
    return <div>No data available for selection.</div>;
  }
  console.log("selectedCell", selectedCell);
  console.log("data", data);

  const { extractedIds, witelName, subType, kategoriUmur } = selectedCell;

  const foundItem = data.find(
    (item) =>
      item.witelName === witelName &&
      item[subType] &&
      item[subType][`${kategoriUmur}Items`]
  );

  if (!foundItem) {
    console.log(
      "Error: No item found with witelName:",
      witelName,
      "and subType:",
      subType
    );
    return <div>No matching data found.</div>;
  }

  const items = foundItem[subType][`${kategoriUmur}Items`] || [];

  const filteredItems = items.filter(
    (item) =>
      extractedIds.includes(item.id) &&
      (selectedCategory === "ALL" || item.order_subtype === selectedCategory)
  );

  console.log("Filtered Items:", filteredItems);

  if (filteredItems.length === 0) {
    return <div>No matching data found.</div>;
  }

  return (
    <div className="selected-table">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Order Subtype</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.order_subtype}</td>
                <td>{item.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
