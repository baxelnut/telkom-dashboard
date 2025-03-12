import React, { useState } from "react";
import "./ReportTable.css";
import Loading from "../../components/Loading";

export default function ReportTable({
  data,
  error,
  loading,
  sendDataToParent,
}) {
  if (error) return <p className="error">Error: {error}</p>;

  const formatCurrency = (value, orderCount) => {
    if (!orderCount) return "";
    return `Rp.${(value || 0).toLocaleString("id-ID")}`;
  };

  const grandTotals = {
    provideOrder: {
      count3Bln: 0,
      countMore3Bln: 0,
      revenue3Bln: 0,
      revenueMore3Bln: 0,
    },
    inProcess: {
      count3Bln: 0,
      countMore3Bln: 0,
      revenue3Bln: 0,
      revenueMore3Bln: 0,
    },
    readyToBill: {
      count3Bln: 0,
      countMore3Bln: 0,
      revenue3Bln: 0,
      revenueMore3Bln: 0,
    },
    total3Bln: 0,
    totalMore3Bln: 0,
    grandTotal: 0,
  };

  data.forEach((entry) => {
    const provideOrder3Bln = entry?.["PROVIDE ORDER"]?.["<3 BLN"] || 0;
    const provideOrderMore3Bln = entry?.["PROVIDE ORDER"]?.[">3 BLN"] || 0;
    const inProcess3Bln = entry?.["IN PROCESS"]?.["<3 BLN"] || 0;
    const inProcessMore3Bln = entry?.["IN PROCESS"]?.[">3 BLN"] || 0;
    const readyToBill3Bln = entry?.["READY TO BILL"]?.["<3 BLN"] || 0;
    const readyToBillMore3Bln = entry?.["READY TO BILL"]?.[">3 BLN"] || 0;

    const revenueProvideOrder3Bln =
      entry?.["PROVIDE ORDER"]?.["revenue<3bln"] || 0;
    const revenueProvideOrderMore3Bln =
      entry?.["PROVIDE ORDER"]?.["revenue>3bln"] || 0;
    const revenueInProcess3Bln = entry?.["IN PROCESS"]?.["revenue<3bln"] || 0;
    const revenueInProcessMore3Bln =
      entry?.["IN PROCESS"]?.["revenue>3bln"] || 0;
    const revenueReadyToBill3Bln =
      entry?.["READY TO BILL"]?.["revenue<3bln"] || 0;
    const revenueReadyToBillMore3Bln =
      entry?.["READY TO BILL"]?.["revenue>3bln"] || 0;

    grandTotals.provideOrder.count3Bln += provideOrder3Bln;
    grandTotals.provideOrder.countMore3Bln += provideOrderMore3Bln;
    grandTotals.provideOrder.revenue3Bln += revenueProvideOrder3Bln;
    grandTotals.provideOrder.revenueMore3Bln += revenueProvideOrderMore3Bln;

    grandTotals.inProcess.count3Bln += inProcess3Bln;
    grandTotals.inProcess.countMore3Bln += inProcessMore3Bln;
    grandTotals.inProcess.revenue3Bln += revenueInProcess3Bln;
    grandTotals.inProcess.revenueMore3Bln += revenueInProcessMore3Bln;

    grandTotals.readyToBill.count3Bln += readyToBill3Bln;
    grandTotals.readyToBill.countMore3Bln += readyToBillMore3Bln;
    grandTotals.readyToBill.revenue3Bln += revenueReadyToBill3Bln;
    grandTotals.readyToBill.revenueMore3Bln += revenueReadyToBillMore3Bln;

    grandTotals.total3Bln += provideOrder3Bln + inProcess3Bln + readyToBill3Bln;
    grandTotals.totalMore3Bln +=
      provideOrderMore3Bln + inProcessMore3Bln + readyToBillMore3Bln;
  });

  grandTotals.grandTotal = grandTotals.total3Bln + grandTotals.totalMore3Bln;

  const [dataToSend, setDataToSend] = useState("");

  const sendData = (witelName, data, statusType, ageCategory, ageRevenue) => {
    if (!witelName || !data || !statusType || !ageCategory) return;

    const filteredData = data
      .filter((entry) => entry.witelName === witelName)
      .map((entry) => {
        const quantity = entry?.[statusType]?.[ageCategory] || 0;
        const revenue = entry?.[statusType]?.[ageRevenue] || 0;

        const items = Array.from({ length: quantity }, (_, index) => ({
          itemName: `Item ${index + 1}`,
          itemRevenue: quantity ? revenue / quantity : 0,
        }));

        return {
          witelName: entry.witelName,
          status: statusType,
          age: ageCategory,
          quantity,
          revenue,
          items,
        };
      });

    // Dynamic title generation
    const title = `${witelName} - ${statusType} (${ageCategory})`;

    const finalData = { title, data: filteredData };

    setDataToSend(finalData);
    sendDataToParent(finalData);

    console.log("Raw Entry Data:", data);
    console.log(
      "Extracted Revenue:",
      data?.[statusType]?.[ageRevenue],
      "Using Key:",
      ageRevenue
    );

    console.log("Final Data Sent:", finalData);
  };

  const statusTypes = ["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"];

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
              {data.map((entry, index) => {
                const total3Bln =
                  (entry?.["PROVIDE ORDER"]?.["<3 BLN"] || 0) +
                  (entry?.["IN PROCESS"]?.["<3 BLN"] || 0) +
                  (entry?.["READY TO BILL"]?.["<3 BLN"] || 0);
                const totalMore3Bln =
                  (entry?.["PROVIDE ORDER"]?.[">3 BLN"] || 0) +
                  (entry?.["IN PROCESS"]?.[">3 BLN"] || 0) +
                  (entry?.["READY TO BILL"]?.[">3 BLN"] || 0);
                const grandTotal = total3Bln + totalMore3Bln;

                return (
                  <tr key={index}>
                    <td>
                      <h6>
                        {entry?.witelName === "MALANG"
                          ? "JATIM TIMUR"
                          : entry?.witelName === "SIDOARJO"
                          ? "JATIM BARAT"
                          : entry?.witelName || "Unknown"}
                      </h6>
                    </td>

                    {statusTypes.map((statusType, idx) => (
                      <td key={idx}>
                        <h6
                          onClick={() =>
                            sendData(
                              entry?.witelName,
                              data,
                              statusType,
                              "<3 BLN",
                              "revenue<3bln"
                            )
                          }
                        >
                          {entry[statusType]?.["<3 BLN"] || 0}
                        </h6>
                        <p>
                          {formatCurrency(
                            entry[statusType]?.["revenue<3bln"],
                            entry[statusType]?.["<3 BLN"]
                          )}
                        </p>
                      </td>
                    ))}

                    <td>
                      <h6
                        onClick={() => {
                          let timeRanges = [];

                          if (columnKey === "total3Bln")
                            timeRanges = ["<3 BLN"];
                          else if (columnKey === "totalMore3Bln")
                            timeRanges = [">3 BLN"];
                          else if (columnKey === "grandTotal")
                            timeRanges = ["<3 BLN", ">3 BLN"];

                          timeRanges.forEach((ageCategory) => {
                            [
                              "PROVIDE ORDER",
                              "IN PROCESS",
                              "READY TO BILL",
                            ].forEach((statusType) => {
                              sendData(
                                entry?.witelName,
                                data,
                                statusType,
                                ageCategory
                              );
                            });
                          });
                        }}
                      >
                        {total3Bln}
                      </h6>
                    </td>

                    {statusTypes.map((statusType, idx) => (
                      <td key={idx}>
                        <h6
                          onClick={() =>
                            sendData(
                              entry?.witelName,
                              data,
                              statusType,
                              ">3 BLN",
                              "revenue>3bln"
                            )
                          }
                        >
                          {entry[statusType]?.[">3 BLN"] || 0}aaaaaa
                        </h6>
                        <p>
                          {formatCurrency(
                            entry[statusType]?.["revenue>3bln"],
                            entry[statusType]?.[">3 BLN"]
                          )}
                        </p>
                      </td>
                    ))}

                    <td>
                      <h6>{totalMore3Bln}d</h6>
                    </td>
                    <td>
                      <h6>{grandTotal}e</h6>
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
                      <h6>{grandTotals[key].count3Bln}f</h6>
                      <p>
                        {formatCurrency(
                          grandTotals[key].revenue3Bln,
                          grandTotals[key].count3Bln
                        )}
                      </p>
                    </td>
                  )
                )}
                <td>
                  <h6>{grandTotals.total3Bln}g</h6>
                </td>
                {["provideOrder", "inProcess", "readyToBill"].map(
                  (key, idx) => (
                    <td key={idx}>
                      <h6>{grandTotals[key].countMore3Bln}h</h6>
                      <p>
                        {formatCurrency(
                          grandTotals[key].revenueMore3Bln,
                          grandTotals[key].countMore3Bln
                        )}
                      </p>
                    </td>
                  )
                )}
                <td>
                  <h6>{grandTotals.totalMore3Bln}i</h6>
                </td>
                <td>
                  <h6>{grandTotals.grandTotal}a</h6>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
