import React from "react";
import "./SelectedTable.css";

export default function SelectedTable({ selectedCell, data }) {
  if (!selectedCell) {
    return <div>No data available for selection.</div>;
  }

  const { extractedIds, witelName, subType, kategoriUmur } = selectedCell;

  console.log("kategoriUmur", kategoriUmur);
  console.log("subType", subType);

  const foundItem = data.find(
    (item) =>
      item.witelName === witelName &&
      item[subType] &&
      item[subType][`${kategoriUmur}Items`]
  );

  if (foundItem) {
    console.log("Found item:", foundItem);

    const items = foundItem[subType][`${kategoriUmur}Items`];
    const filteredItems = items.filter((item) =>
      extractedIds.includes(item.id)
    );

    console.log("Filtered Items based on extractedIds:", filteredItems);

    if (filteredItems.length === 0) {
      console.log("No matching items found with the extractedIds");
    }
  } else {
    console.log(
      "Error: No item found with witelName:",
      witelName,
      "and subType:",
      subType
    );
  }

  if (!Array.isArray(data)) {
    return (
      <div>Error: Data is not available or not in the correct format.</div>
    );
  }

  const rows = extractedIds.map((id) => {
    const itemInfo = foundItem
      ? foundItem[subType][`${kategoriUmur}Items`].find(
          (item) => item.id === id
        )
      : null;

    return itemInfo ? (
      <tr key={id}>
        <td>{itemInfo.id}</td>
        <td>{itemInfo.order_subtype}</td>
        <td>{itemInfo.revenue}</td>
      </tr>
    ) : (
      <tr key={id}>
        <td colSpan="3">No data found for ID {id}</td>
      </tr>
    );
  });

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
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
  );
}
