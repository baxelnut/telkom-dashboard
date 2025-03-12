import React from "react";
import "./ReportTableDetails.css";

export default function ReportTableDetails({ filteredData }) {
  if (!filteredData) return <p className="error">No data available.</p>;

  const isLessThan3Bln = filteredData["<3Bln"] !== undefined;
  const isMoreThan3Bln = filteredData[">3Bln"] !== undefined;

  const timeFilterKey = isLessThan3Bln ? "<3blnItems" : ">3blnItems";
  const timeFilterLabel = isLessThan3Bln ? "<3 BLN" : ">3 BLN";
  const items = filteredData[timeFilterKey] || [];

  return (
    <div className="report-table-wrapper">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>LI ID</th>
              <th>Name</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={index}>
                  <td>{item.itemId}</td>
                  <td>{item.itemName}</td>
                  <td>Rp.{(item.itemRevenue || 0).toLocaleString("id-ID")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">
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
