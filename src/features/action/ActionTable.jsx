import React, { useState } from "react";
import "./ActionTable.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

const STATUSES = ["Lanjut", "Cancel", "Bukan Order Reg"];

export default function ActionTable({
  actionTabledata,
  onRowClick,
  loading,
  error,
}) {
  if (loading) return <Loading backgroundColor="transparent" />;
  if (error) return <Error message={error} />;

  const [selectedWitel, setSelectedWitel] = useState(null);
  const dataArray = actionTabledata?.data ?? [];

  const handleRowClick = (witelName) => {
    setSelectedWitel(witelName);
    if (onRowClick) onRowClick(witelName);
  };

  const bucketCounts = (row, bucket) => {
    const isUnder = bucket === "<";
    const arr = row.items || [];
    let counts = { Lanjut: 0, Cancel: 0, "Bukan Order Reg": 0 };

    console.log("Processing row:", row);
    console.log("Items in this row:", arr);

    arr.forEach((item) => {
      console.log("Processing item:", item);

      if (
        (isUnder && item.ageInMonths < 3) ||
        (!isUnder && item.ageInMonths >= 3)
      ) {
        const status = item.STATUS;
        console.log("Item status:", status);

        if (counts[status] !== undefined) counts[status]++;
      }
    });
    counts.TOTAL = counts.Lanjut + counts.Cancel + counts["Bukan Order Reg"];
    return counts;
  };

  return (
    <div className="action-table">
      <table>
        <thead>
          <tr>
            <th rowSpan="2">PO_NAME</th>
            <th rowSpan="2">WITEL</th>
            <th colSpan={4}>&lt;3bln</th>
            <th colSpan={4}>&gt;3bln</th>
          </tr>
          <tr>
            {STATUSES.map((s) => (
              <th key={`u-${s}`}>{s}</th>
            ))}
            <th key="u-total">TOTAL</th>
            {STATUSES.map((s) => (
              <th key={`o-${s}`}>{s}</th>
            ))}
            <th key="o-total">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {dataArray.map((row, idx) => {
            const under = bucketCounts(row, "<");
            const over = bucketCounts(row, ">");
            return (
              <tr
                key={idx}
                className="action-table-row"
                onClick={() => handleRowClick(row.BILL_WITEL)}
              >
                <td>{row.PO_NAME}</td>
                <td>{row.WITEL}</td>

                {STATUSES.map((s) => (
                  <td key={`u-${idx}-${s}`}>{under[s]}</td>
                ))}
                <td key={`u-${idx}-total`}>{under.TOTAL}</td>

                {STATUSES.map((s) => (
                  <td key={`o-${idx}-${s}`}>{over[s]}</td>
                ))}
                <td key={`o-${idx}-total`}>{over.TOTAL}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
