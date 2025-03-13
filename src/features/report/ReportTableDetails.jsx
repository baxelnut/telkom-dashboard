import React from "react";
import "./ReportTableDetails.css";

export default function ReportTableDetails({ filteredData }) {
  if (!filteredData) return <p className="error">No data available.</p>;

  const isLessThan3Bln = filteredData["<3Bln"] !== undefined;
  const isMoreThan3Bln = filteredData[">3Bln"] !== undefined;

  const timeFilterKey = isLessThan3Bln ? "<3Bln" : ">3Bln";
  const itemKey = isLessThan3Bln ? "<3blnItems" : ">3blnItems";
  const items = filteredData[itemKey] || [];

  return (
    <div className="report-details-wrapper">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {filteredData.statusType === "IN PROCESS" && <th>STATUS</th>}
              <th>LI ID</th>
              <th>STANDARD NAME</th>
              <th>REVENUE</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={index}>
                  {filteredData.statusType === "IN PROCESS" && (
                    <td>
                      <button className="action-button">
                        {item.status || "null"}
                      </button>
                    </td>
                  )}
                  <td>{item.itemId}</td>
                  <td>{item.itemName}</td>
                  <td>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(item.itemRevenue || 0)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={filteredData.statusType === "IN PROCESS" ? 4 : 3}
                  className="no-data"
                >
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
