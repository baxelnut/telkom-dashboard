import React from "react";
import "./ReportTableDetails.css";

export default function ReportTableDetails({ filteredData }) {
  if (!filteredData) return <p>No data available.</p>;

  const {
    witelName,
    statusType,
    "<3Bln": lessThan3,
    "revenue<3Bln": revenueLess,
    "<3blnItems": lessThan3Items,
    ">3Bln": moreThan3,
    "revenue>3Bln": revenueMore,
    ">3blnItems": moreThan3Items,
  } = filteredData;

  return (
    <div className="report-details">
      <h3>{witelName}</h3>
      <h4>Status: {statusType}</h4>

      {lessThan3 !== undefined && (
        <div>
          <h5>📉 Below 3 Months</h5>
          <table>
            <thead>
              <tr>
                <th>Count</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{lessThan3}</td>
                <td>{revenueLess?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {lessThan3Items?.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Item Name</th>
                  <th>Item Revenue</th>
                </tr>
              </thead>
              <tbody>
                {lessThan3Items.map((item) => (
                  <tr key={item.itemId}>
                    <td>{item.itemId}</td>
                    <td>{item.itemName}</td>
                    <td>💰 {item.itemRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {moreThan3 !== undefined && (
        <div>
          <h5>📈 Above 3 Months</h5>
          <table>
            <thead>
              <tr>
                <th>Count</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{moreThan3}</td>
                <td>{revenueMore?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {moreThan3Items?.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Item Name</th>
                  <th>Item Revenue</th>
                </tr>
              </thead>
              <tbody>
                {moreThan3Items.map((item) => (
                  <tr key={item.itemId}>
                    <td>{item.itemId}</td>
                    <td>{item.itemName}</td>
                    <td>💰 {item.itemRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
