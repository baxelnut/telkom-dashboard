import React from "react";
import "./ActionTable.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

export default function ActionTable({
  actionTabledata,
  selectedCategory,
  orderSubtypes,
  loading,
  error,
  onCellSelect,
}) {
  if (loading) return <Loading backgroundColor="transparent" />;
  if (error) return <Error message={error} />;

  const dataArray = actionTabledata?.data ?? [];
  const headers = dataArray.length > 0 ? Object.keys(dataArray[0]) : [];

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
            <tr key={rowIndex}>
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
