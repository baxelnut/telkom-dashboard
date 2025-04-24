import React from "react";
import "./TableScroll.css";

export default function TableScroll({ data, currentPage, rowsPerPage }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>
              <h6>No.</h6>
            </th>
            {Object.keys(data[0] || {}).map((key) => (
              <th key={key}>
                <h6>{key}</h6>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>
                <p>{currentPage * rowsPerPage + index + 1}</p>
              </td>
              {Object.values(row).map((value, i) => (
                <td key={i}>
                  <p className="overview-table-items">{value || "-"}</p>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
