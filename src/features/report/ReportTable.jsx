import React from "react";
import "./ReportTable.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

const orderSubtypes = ["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"];

const formatCurrency = (value) =>
  value ? `Rp${value.toLocaleString("id-ID")}` : null;

const calculateTotal = (entry, category) =>
  orderSubtypes.reduce(
    (total, subtype) => total + (entry?.[subtype]?.[category] ?? 0),
    0
  );

export default function ReportTable({ reportTableData, loading, error }) {
  if (loading) return <Loading backgroundColor="transparent" />;
  if (error) return <Error />;

  const calculateCategoryGrandTotal = (reportData, categoryKey, subtypeKey) => {
    return reportData["data"].reduce((total, entry) => {
      const value = entry?.[subtypeKey]?.[categoryKey] ?? 0;
      return total + value;
    }, 0);
  };

  const totalProvideOrder3BlnGrand = calculateCategoryGrandTotal(
    reportTableData,
    "kategori_umur_<3bln",
    "PROVIDE ORDER"
  );
  const totalProvideOrderMore3BlnGrand = calculateCategoryGrandTotal(
    reportTableData,
    "kategori_umur_>3bln",
    "PROVIDE ORDER"
  );
  const totalInProcess3BlnGrand = calculateCategoryGrandTotal(
    reportTableData,
    "kategori_umur_<3bln",
    "IN PROCESS"
  );
  const totalInProcessMore3BlnGrand = calculateCategoryGrandTotal(
    reportTableData,
    "kategori_umur_>3bln",
    "IN PROCESS"
  );
  const totalReadyToBill3BlnGrand = calculateCategoryGrandTotal(
    reportTableData,
    "kategori_umur_<3bln",
    "READY TO BILL"
  );
  const totalReadyToBillMore3BlnGrand = calculateCategoryGrandTotal(
    reportTableData,
    "kategori_umur_>3bln",
    "READY TO BILL"
  );

  const total3BlnGrand =
    totalProvideOrder3BlnGrand +
    totalInProcess3BlnGrand +
    totalReadyToBill3BlnGrand;
  const totalMore3BlnGrand =
    totalProvideOrderMore3BlnGrand +
    totalInProcessMore3BlnGrand +
    totalReadyToBillMore3BlnGrand;

  const totalRevenue3BlnGrand =
    calculateCategoryGrandTotal(
      reportTableData,
      "revenue_<3bln",
      "PROVIDE ORDER"
    ) +
    calculateCategoryGrandTotal(
      reportTableData,
      "revenue_<3bln",
      "IN PROCESS"
    ) +
    calculateCategoryGrandTotal(
      reportTableData,
      "revenue_<3bln",
      "READY TO BILL"
    );

  const totalRevenueMore3BlnGrand =
    calculateCategoryGrandTotal(
      reportTableData,
      "revenue_>3bln",
      "PROVIDE ORDER"
    ) +
    calculateCategoryGrandTotal(
      reportTableData,
      "revenue_>3bln",
      "IN PROCESS"
    ) +
    calculateCategoryGrandTotal(
      reportTableData,
      "revenue_>3bln",
      "READY TO BILL"
    );

  const grandTotal = total3BlnGrand + totalMore3BlnGrand;
  const grandRevenue = totalRevenue3BlnGrand + totalRevenueMore3BlnGrand;

  const renderRowCells = (entry, categoryKey, revenueKey) =>
    orderSubtypes.map((subtype, idx) => {
      const count = entry?.[subtype]?.[categoryKey] ?? 0;
      const revenue = formatCurrency(entry?.[subtype]?.[revenueKey]);
      const isDisabled = count === 0;

      return (
        <td key={idx} className={isDisabled ? "disabled-cell" : ""}>
          <h6>{count}</h6>
          <p>{revenue}</p>
        </td>
      );
    });

  return (
    <div className="report-table">
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
              {orderSubtypes.map((label, index) => (
                <th key={index}>{label}</th>
              ))}
              {orderSubtypes.map((label, index) => (
                <th key={index}>{label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {reportTableData["data"].map((entry, index) => {
              const total3Bln = calculateTotal(entry, "kategori_umur_<3bln");
              const totalRevenue3Bln = calculateTotal(entry, "revenue_<3bln");
              const totalMore3Bln = calculateTotal(
                entry,
                "kategori_umur_>3bln"
              );
              const totalRevenueMore3Bln = calculateTotal(
                entry,
                "revenue_>3bln"
              );
              const grandTotal = total3Bln + totalMore3Bln;
              const grandRevenue = totalRevenue3Bln + totalRevenueMore3Bln;

              return (
                <tr key={index}>
                  <td className="unresponsive">
                    <h6>{entry?.witelName}</h6>
                  </td>

                  {/* Render <3 BLN columns */}
                  {renderRowCells(
                    entry,
                    "kategori_umur_<3bln",
                    "revenue_<3bln"
                  )}

                  <td className="unresponsive">
                    <h6>{total3Bln}</h6>
                    <p>{formatCurrency(totalRevenue3Bln)}</p>
                  </td>

                  {/* Render >3 BLN columns */}
                  {renderRowCells(
                    entry,
                    "kategori_umur_>3bln",
                    "revenue_>3bln"
                  )}

                  <td className="unresponsive">
                    <h6>{totalMore3Bln}</h6>
                    <p>{formatCurrency(totalRevenueMore3Bln)}</p>
                  </td>

                  <td className="unresponsive">
                    <h6>{grandTotal}</h6>
                    <p>{formatCurrency(grandRevenue)}</p>
                  </td>
                </tr>
              );
            })}

            {/* Grand Total Row */}
            <tr className="grand-total-row">
              <td className="grand-total-title">
                <h6>GRAND TOTAL</h6>
              </td>

              {/* <3 BLN PROVIDE ORDER */}
              <td>
                <h6>
                  {calculateCategoryGrandTotal(
                    reportTableData,
                    "kategori_umur_<3bln",
                    "PROVIDE ORDER"
                  )}
                </h6>
                <p>
                  {formatCurrency(
                    calculateCategoryGrandTotal(
                      reportTableData,
                      "revenue_<3bln",
                      "PROVIDE ORDER"
                    )
                  )}
                </p>
              </td>

              {/* <3 BLN IN PROCESS */}
              <td>
                <h6>
                  {calculateCategoryGrandTotal(
                    reportTableData,
                    "kategori_umur_<3bln",
                    "IN PROCESS"
                  )}
                </h6>
                <p>
                  {formatCurrency(
                    calculateCategoryGrandTotal(
                      reportTableData,
                      "revenue_<3bln",
                      "IN PROCESS"
                    )
                  )}
                </p>
              </td>

              {/* <3 BLN READY TO BILL */}
              <td>
                <h6>
                  {calculateCategoryGrandTotal(
                    reportTableData,
                    "kategori_umur_<3bln",
                    "READY TO BILL"
                  )}
                </h6>
                <p>
                  {formatCurrency(
                    calculateCategoryGrandTotal(
                      reportTableData,
                      "revenue_<3bln",
                      "READY TO BILL"
                    )
                  )}
                </p>
              </td>

              {/* <3 BLN Total */}
              <td className="unresponsive">
                <h6>{total3BlnGrand}</h6>
                <p>{formatCurrency(totalRevenue3BlnGrand)}</p>
              </td>

              {/* >3 BLN PROVIDE ORDER */}
              <td>
                <h6>
                  {calculateCategoryGrandTotal(
                    reportTableData,
                    "kategori_umur_>3bln",
                    "PROVIDE ORDER"
                  )}
                </h6>
                <p>
                  {formatCurrency(
                    calculateCategoryGrandTotal(
                      reportTableData,
                      "revenue_>3bln",
                      "PROVIDE ORDER"
                    )
                  )}
                </p>
              </td>

              {/* >3 BLN IN PROCESS */}
              <td>
                <h6>
                  {calculateCategoryGrandTotal(
                    reportTableData,
                    "kategori_umur_>3bln",
                    "IN PROCESS"
                  )}
                </h6>
                <p>
                  {formatCurrency(
                    calculateCategoryGrandTotal(
                      reportTableData,
                      "revenue_>3bln",
                      "IN PROCESS"
                    )
                  )}
                </p>
              </td>

              {/* >3 BLN READY TO BILL */}
              <td>
                <h6>
                  {calculateCategoryGrandTotal(
                    reportTableData,
                    "kategori_umur_>3bln",
                    "READY TO BILL"
                  )}
                </h6>
                <p>
                  {formatCurrency(
                    calculateCategoryGrandTotal(
                      reportTableData,
                      "revenue_>3bln",
                      "READY TO BILL"
                    )
                  )}
                </p>
              </td>

              {/* >3 BLN Total */}
              <td className="unresponsive">
                <h6>{totalMore3BlnGrand}</h6>
                <p>{formatCurrency(totalRevenueMore3BlnGrand)}</p>
              </td>

              {/* Grand Total */}
              <td className="unresponsive">
                <h6>{grandTotal}</h6>
                <p>{formatCurrency(grandRevenue)}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
