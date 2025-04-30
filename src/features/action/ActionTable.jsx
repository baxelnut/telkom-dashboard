import React, { useState } from "react";
import "./ActionTable.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

export default function ActionTable({
  actionTabledata,
  loading,
  error,
  onRowClick,
}) {
  if (loading) return <Loading backgroundColor="transparent" />;
  if (error) return <Error message={error} />;

  const [selectedWitel, setSelectedWitel] = useState(null);

  const dataArray = actionTabledata?.data ?? [];
  const excludedKeys = ["PO_EMAIL", "BILL_WITEL"];

  const handleRowClick = (witelName) => {
    setSelectedWitel(witelName);
    if (onRowClick) onRowClick(witelName);
  };

  const headers =
    dataArray.length > 0
      ? [
          ...Object.keys(dataArray[0]).filter(
            (key) => !excludedKeys.includes(key)
          ),
        ]
      : [];

  return (
    <div className="action-table">
      <table>
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th key={i}>{header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {dataArray.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="action-table-row"
              onClick={() => handleRowClick(row.BILL_WITEL)}
            >
              {headers.map((header, colIndex) => (
                <td key={colIndex}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
