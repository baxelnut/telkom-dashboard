import React, { useState, useEffect } from "react";
import "./ReportTableDetails.css";

export default function ReportTableDetails({ filteredData, onUpdateStatus }) {
  if (!filteredData) return <p className="error">No data available.</p>;

  const isLessThan3Bln = filteredData["<3Bln"] !== undefined;
  const itemKey = isLessThan3Bln ? "<3blnItems" : ">3blnItems";
  const items = filteredData[itemKey] || [];

  const statusOptions = ["", "Lanjut", "Cancel", "Bukan Order Reg"];

  const [localData, setLocalData] = useState([]);

  useEffect(() => {
    setLocalData(
      items.map((item) => ({
        ...item,
        processStatus: item.processStatus || "",
      }))
    );
  }, [filteredData]);

  const handleStatusChange = (index, newStatus) => {
    const updatedData = [...localData];
    updatedData[index].processStatus = newStatus;
    setLocalData(updatedData);

    const updatedFilteredData = { ...filteredData };
    updatedFilteredData[itemKey][index].processStatus = newStatus;
    onUpdateStatus(updatedFilteredData);
  };

  return (
    <div className="report-details-wrapper">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {filteredData.statusType === "IN PROCESS" && <th>STATUS</th>}
              <th>LI ID</th>
              <th>CATEGORY</th>
              <th>WITEL</th>
              <th>STANDARD NAME</th>
              <th>REVENUE</th>
            </tr>
          </thead>
          <tbody>
            {localData.length > 0 ? (
              localData.map((item, index) => (
                <tr key={index}>
                  {filteredData.statusType === "IN PROCESS" && (
                    <td>
                      <select
                        className={`action-dropdown ${
                          item.processStatus ? "selected" : "not-selected"
                        }`}
                        value={item.processStatus}
                        onChange={(e) =>
                          handleStatusChange(index, e.target.value)
                        }
                      >
                        {statusOptions.map((option, idx) => (
                          <option key={idx} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td>{item.itemId}</td>
                  <td>{item.category}</td>
                  <td>{filteredData.witelName}</td>
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
                  colSpan={filteredData.statusType === "IN PROCESS" ? 6 : 5}
                  className="no-data"
                >
                  <p>No items found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <pre>{JSON.stringify(filteredData, null, 2)}</pre>
      {/* pass this filtered data to parent*/}
    </div>
  );
}
