import React from "react";
import "./ActionTable.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

const STATUSES = ["Lanjut", "Cancel", "Bukan Order Reg", "No Status"];

export default function ActionTable({
  actionTabledata,
  onRowClick,
  loading,
  error,
  selectedWitel,
}) {
  if (loading) return <Loading backgroundColor="transparent" />;
  if (error) return <Error message={error} />;

  const bucketCounts = (items, bucket, selectedPic) => {
    const counts = {
      Lanjut: 0,
      Cancel: 0,
      "Bukan Order Reg": 0,
      "No Status": 0,
    };

    items.forEach((it) => {
      if (
        it._bucket === bucket &&
        it.KATEGORI === "IN PROCESS" &&
        it.PIC === selectedPic
      ) {
        const raw = (it.STATUS || "").trim();
        if (!raw) {
          counts["No Status"]++;
        } else {
          const key = {
            lanjut: "Lanjut",
            cancel: "Cancel",
            "bukan order reg": "Bukan Order Reg",
          }[raw.toLowerCase()];
          if (key) {
            counts[key]++;
          } else {
            counts["No Status"]++;
          }
        }
      }
    });

    counts.TOTAL =
      counts.Lanjut +
      counts.Cancel +
      counts["Bukan Order Reg"] +
      counts["No Status"];
    return counts;
  };

  const dataArray = actionTabledata.data || [];

  return (
    <div className="action-table">
      <table>
        <thead>
          <tr>
            <th rowSpan="2">
              <h6>PO</h6>
            </th>
            <th rowSpan="2">
              <h6>WITEL</h6>
            </th>
            <th colSpan={STATUSES.length + 1}>
              <h6>&lt;3 BLN</h6>
            </th>
            <th colSpan={STATUSES.length + 1}>
              <h6>&gt;3 BLN</h6>
            </th>
            <th rowSpan="2">
              <h6>GRAND TOTAL</h6>
            </th>
          </tr>
          <tr>
            {STATUSES.map((s) => (
              <th key={`u-${s}`}>
                <h6>{s}</h6>
              </th>
            ))}
            <th>
              <h6>Total</h6>
            </th>
            {STATUSES.map((s) => (
              <th key={`o-${s}`}>
                <h6>{s}</h6>
              </th>
            ))}
            <th>
              <h6>Total</h6>
            </th>
          </tr>
        </thead>

        <tbody>
          {dataArray.map((row, idx) => {
            const under = bucketCounts(row.items || [], "<", row.PO_NAME);
            const over = bucketCounts(row.items || [], ">", row.PO_NAME);

            return (
              <tr
                key={idx}
                className="action-table-row"
                onClick={() =>
                  onRowClick(row.BILL_WITEL, row.WITEL, row.PO_NAME)
                }
              >
                <td>
                  <p>{row.PO_NAME}</p>
                </td>

                <td>
                  <p>{row.WITEL}</p>
                </td>

                {STATUSES.map((s) => (
                  <td key={`u-${idx}-${s}`} className="u-cell">
                    <p>{under[s]} </p>
                  </td>
                ))}

                <td className="tot-cell">
                  <h6>{under.TOTAL}</h6>
                </td>

                {STATUSES.map((s) => (
                  <td key={`o-${idx}-${s}`} className="o-cell">
                    <p>{over[s]}</p>
                  </td>
                ))}

                <td className="tot-cell">
                  <h6>{over.TOTAL}</h6>
                </td>

                <td className="tot-cell grand-total-cell">
                  <h6>{under.TOTAL + over.TOTAL}</h6>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
