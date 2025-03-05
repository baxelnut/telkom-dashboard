import React, { useState, useEffect } from "react";
import "./ReportTable.css";
import Loading from "../../components/Loading";

export default function ReportTable() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/data");
        const jsonData = await response.json();

        const groupedCounts = processData(jsonData);
        setCounts(groupedCounts);
      } catch (error) {
        console.error("Error fetching data from backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processData = (data) => {
    return data.reduce((acc, row) => {
      const witel = row["SERVICE_WITEL"];
      const kategoriUmur = row["KATEGORI_UMUR"];
      const kategori = row["KATEGORI"];
      const revenue = parseFloat(row["REVENUE"]) || 0;

      if (!acc[witel]) {
        acc[witel] = {
          "<3 bulan": 0,
          ">3 bulan": 0,
          "PROVIDE ORDER": { count: 0, revenue: 0 },
          "IN PROCESS": { count: 0, revenue: 0 },
          "READY TO BILL": { count: 0, revenue: 0 },
        };
      }

      if (kategoriUmur === "< 3 BLN") acc[witel]["<3 bulan"]++;
      if (kategoriUmur === "> 3 BLN") acc[witel][">3 bulan"]++;

      if (kategori in acc[witel]) {
        acc[witel][kategori].count++;
        acc[witel][kategori].revenue += revenue;
      }

      return acc;
    }, {});
  };

  const formatCurrency = (value) =>
    value === 0 ? null : `Rp.${value.toLocaleString("id-ID")}`;

  const grandTotals = {
    provideOrder: { count: 0, revenue: 0 },
    inProcess: { count: 0, revenue: 0 },
    readyToBill: { count: 0, revenue: 0 },
    total3Bln: 0,
    totalMore3Bln: 0,
    grandTotal: 0,
  };

  Object.values(counts).forEach((data) => {
    grandTotals.provideOrder.count += data["PROVIDE ORDER"].count;
    grandTotals.provideOrder.revenue += data["PROVIDE ORDER"].revenue;
    grandTotals.inProcess.count += data["IN PROCESS"].count;
    grandTotals.inProcess.revenue += data["IN PROCESS"].revenue;
    grandTotals.readyToBill.count += data["READY TO BILL"].count;
    grandTotals.readyToBill.revenue += data["READY TO BILL"].revenue;
    grandTotals.total3Bln += data["<3 bulan"];
    grandTotals.totalMore3Bln += data[">3 bulan"];
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
              {Object.entries(counts).map(([witel, data], index) => {
                const total3Bln = data["<3 bulan"];
                const totalMore3Bln = data[">3 bulan"];
                const grandTotal = total3Bln + totalMore3Bln;

                return (
                  <tr key={index}>
                    <td>
                      <h6>{witel}</h6>
                    </td>
                    {["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"].map(
                      (label, idx) => (
                        <td key={idx}>
                          <h6>{data[label].count}</h6>
                          <p>{formatCurrency(data[label].revenue)}</p>
                        </td>
                      )
                    )}
                    <td>
                      <h6>{total3Bln}</h6>
                    </td>
                    {["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"].map(
                      (label, idx) => (
                        <td key={idx}>
                          <h6>{data[label].count}</h6>
                          <p>{formatCurrency(data[label].revenue)}</p>
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
