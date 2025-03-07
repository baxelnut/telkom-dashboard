import React from "react";
import "./ReportTable.css";
import Loading from "../../components/Loading";

export default function ReportTable({ data, error, loading }) {
  if (error) return <p className="error">Error: {error}</p>;

  const formatCurrency = (value) =>
    value ? `Rp.${value.toLocaleString("id-ID")}` : "Rp.0";

  const grandTotals = {
    provideOrder: { count: 0, revenue: 0 },
    inProcess: { count: 0, revenue: 0 },
    readyToBill: { count: 0, revenue: 0 },
    total3Bln: 0,
    totalMore3Bln: 0,
    grandTotal: 0,
  };

  Object.values(data).forEach((entry) => {
    grandTotals.provideOrder.count +=
      (entry["PROVIDE ORDER"]?.["<3 BLN"] || 0) +
      (entry["PROVIDE ORDER"]?.[">3 BLN"] || 0);
    grandTotals.provideOrder.revenue += entry["PROVIDE ORDER"]?.revenue || 0;

    grandTotals.inProcess.count +=
      (entry["IN PROCESS"]?.["<3 BLN"] || 0) +
      (entry["IN PROCESS"]?.[">3 BLN"] || 0);
    grandTotals.inProcess.revenue += entry["IN PROCESS"]?.revenue || 0;

    grandTotals.readyToBill.count +=
      (entry["READY TO BILL"]?.["<3 BLN"] || 0) +
      (entry["READY TO BILL"]?.[">3 BLN"] || 0);
    grandTotals.readyToBill.revenue += entry["READY TO BILL"]?.revenue || 0;

    grandTotals.total3Bln += entry["<3 BLN"] || 0;
    grandTotals.totalMore3Bln += entry[">3 BLN"] || 0;
  });

  grandTotals.grandTotal = grandTotals.total3Bln + grandTotals.totalMore3Bln;

  return (
    <div className="report-table-wrapper">
      {loading ? (
        <Loading />
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th rowSpan="2">WITEL</th>
                <th colSpan="3">&lt;3 BLN</th>
                <th rowSpan="2">&lt;3 BLN Total</th>
                <th colSpan="3">&gt;3 BLN</th>
                <th rowSpan="2">&gt;3 BLN Total</th>
                <th rowSpan="2">Grand Total</th>
              </tr>
              <tr>
                {["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"].map(
                  (label, index) => (
                    <th key={index}>{label}</th>
                  )
                )}
                {["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"].map(
                  (label, index) => (
                    <th key={index}>{label}</th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {Object.entries(data).map(([witel, entry], index) => {
                const total3Bln = entry["<3 BLN"] || 0;
                const totalMore3Bln = entry[">3 BLN"] || 0;
                const grandTotal = total3Bln + totalMore3Bln;

                return (
                  <tr key={index}>
                    <td>
                      <h6>{entry.witelName}</h6>
                    </td>
                    {["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"].map(
                      (label, idx) => (
                        <td key={idx}>
                          <h6>{entry[label]?.["<3 BLN"] || 0}</h6>
                          <p>{formatCurrency(entry[label]?.revenue || 0)}</p>
                        </td>
                      )
                    )}
                    <td>
                      <h6>{total3Bln}</h6>
                    </td>
                    {["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"].map(
                      (label, idx) => (
                        <td key={idx}>
                          <h6>{entry[label]?.[">3 BLN"] || 0}</h6>
                          <p>{formatCurrency(entry[label]?.revenue || 0)}</p>
                        </td>
                      )
                    )}
                    <td>
                      <h6>{totalMore3Bln}</h6>
                    </td>
                    <td>
                      <h6>{grandTotal}</h6>
                    </td>
                  </tr>
                );
              })}

              <tr className="grand-total-row">
                <td>
                  <h6>GRAND TOTAL</h6>
                </td>
                {["provideOrder", "inProcess", "readyToBill"].map(
                  (key, idx) => (
                    <td key={idx}>
                      <h6>{grandTotals[key].count}</h6>
                      <p>{formatCurrency(grandTotals[key].revenue)}</p>
                    </td>
                  )
                )}
                <td>
                  <h6>{grandTotals.total3Bln}</h6>
                </td>
                {["provideOrder", "inProcess", "readyToBill"].map(
                  (key, idx) => (
                    <td key={idx}>
                      <h6>{grandTotals[key].count}</h6>
                      <p>{formatCurrency(grandTotals[key].revenue)}</p>
                    </td>
                  )
                )}
                <td>
                  <h6>{grandTotals.totalMore3Bln}</h6>
                </td>
                <td>
                  <h6>{grandTotals.grandTotal}</h6>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
