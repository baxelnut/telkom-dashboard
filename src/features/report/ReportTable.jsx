import React, { useState } from "react";
import "./ReportTable.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

const orderSubtypes = [
  "BILLING COMPLETED",
  "PROVIDE ORDER",
  "IN PROCESS",
  "READY TO BILL",
];

const formatCurrency = (value) =>
  value ? `Rp${value.toLocaleString("id-ID")}` : null;

export default function ReportTable({
  reportTableData,
  selectedCategory,
  selectedPeriod,
  loading,
  error,
}) {
  const [selectedCell, setSelectedCell] = useState(null);

  if (loading) return <Loading backgroundColor="transparent" />;
  if (error) return <Error />;

  const filteredData = reportTableData.data.map((entry) => {
    return {
      ...entry,
      "BILLING COMPLETED": {
        ...entry["BILLING COMPLETED"],
        "<3blnItems": entry["BILLING COMPLETED"]["<3blnItems"].filter(
          (item) =>
            selectedCategory === "ALL" ||
            item.order_subtype === selectedCategory
        ),
        ">3blnItems": entry["BILLING COMPLETED"][">3blnItems"].filter(
          (item) =>
            selectedCategory === "ALL" ||
            item.order_subtype === selectedCategory
        ),
      },
    };
  });

  const handleCellClick = (witelName, idString) => {
    const [mainCategory, subCategory] = idString.split("-");
    const entry = reportTableData.data.find(
      (item) => item.witelName === witelName
    );
    if (!entry || !entry[mainCategory]) {
      return;
    }

    const categoryKey = subCategory.includes("<3bln")
      ? "<3blnItems"
      : ">3blnItems";
    const extractedIds =
      entry[mainCategory]?.[categoryKey]?.map((i) => i.id) || [];

    setSelectedCell({ witelName, id: idString, extractedIds });
  };

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

  const renderRowCells = (
    entry,
    categoryKey,
    revenueKey,
    kategoriUmurKeyKey,
    subtypeKey
  ) =>
    orderSubtypes.map((subtype, idx) => {
      const filteredItems = entry?.[subtype]?.[kategoriUmurKeyKey]?.filter(
        (item) =>
          selectedCategory === "ALL" || item[subtypeKey] === selectedCategory
      );
      const count = filteredItems?.length || 0;
      const revenue = formatCurrency(entry?.[subtype]?.[revenueKey]);
      const orderSubtypeList =
        filteredItems?.map((item) => item[subtypeKey]).join(", ") || null;

      const isDisabled = count === 0;
      const cellData = {
        witelName: entry.witelName,
        id: `${subtype}-${categoryKey}`,
      };

      const isSelected =
        selectedCell &&
        selectedCell.witelName === entry.witelName &&
        selectedCell.id === cellData.id;

      return (
        <td
          key={idx}
          className={`${isDisabled ? "disabled-cell" : ""} ${
            isSelected ? "selected-cell" : ""
          }`}
          onClick={() =>
            !isDisabled && handleCellClick(cellData.witelName, cellData.id)
          }
        >
          <h6>{orderSubtypeList ? count : "0"}</h6>
          <p>{orderSubtypeList ? revenue : null}</p>
        </td>
      );
    });

  const renderTotalCells = (entry, kategoriUmurKey, subtypeKey) => {
    let totalCount = 0;
    let totalRevenue = 0;

    orderSubtypes.forEach((subtype) => {
      const itemData = entry?.[subtype]?.[kategoriUmurKey] || [];

      const filteredItems = itemData.filter((item) => {
        return (
          selectedCategory === "ALL" || selectedCategory === item[subtypeKey]
        );
      });

      totalCount += filteredItems.length;
      totalRevenue += filteredItems.reduce(
        (total, item) => total + (item.revenue || 0),
        0
      );
    });

    return (
      <td className="unresponsive">
        <h6>{totalCount}</h6>
        <p>{formatCurrency(totalRevenue)}</p>
      </td>
    );
  };

  const renderGrandTotalCells = (entry, subtypeKey) => {
    let totalCount = 0;
    let totalRevenue = 0;

    ["<3blnItems", ">3blnItems"].forEach((kategoriUmurKey) => {
      orderSubtypes.forEach((subtype) => {
        const itemData = entry?.[subtype]?.[kategoriUmurKey] || [];

        const filteredItems = itemData.filter((item) => {
          return (
            selectedCategory === "ALL" || selectedCategory === item[subtypeKey]
          );
        });

        totalCount += filteredItems.length;
        totalRevenue += filteredItems.reduce(
          (total, item) => total + (item.revenue || 0),
          0
        );
      });
    });

    return (
      <td className="unresponsive">
        <h6>{totalCount}</h6>
        <p>{formatCurrency(totalRevenue)}</p>
      </td>
    );
  };

  return (
    <div className="report-table">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th rowSpan="2">WITEL</th>
              <th colSpan={orderSubtypes.length}>&lt;3 BLN</th>
              <th rowSpan="2">&lt;3 BLN Total</th>
              <th colSpan={orderSubtypes.length}>&gt;3 BLN</th>
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
              return (
                <tr key={index}>
                  <td className="unresponsive">
                    <h6>{entry?.witelName}</h6>
                  </td>
                  {/* Render <3 BLN columns */}
                  {renderRowCells(
                    entry,
                    "kategori_umur_<3bln",
                    "revenue_<3bln",
                    "<3blnItems",
                    "order_subtype"
                  )}
                  {/* Grand Total <3 BLN on each witel */}
                  {renderTotalCells(entry, "<3blnItems", "order_subtype")}
                  {/* Render >3 BLN columns */}
                  {renderRowCells(
                    entry,
                    "kategori_umur_>3bln",
                    "revenue_>3bln",
                    ">3blnItems",
                    "order_subtype"
                  )}
                  {/* Grand Total >3 BLN on each witel */}
                  {renderTotalCells(entry, ">3blnItems", "order_subtype")}
                  {/* Grand Total*/}
                  {renderGrandTotalCells(entry, "order_subtype")}
                </tr>
              );
            })}

            {/* Grand Total Row */}
            <tr className="grand-total-row">
              <td className="grand-total-title">
                <h6>GRAND TOTAL</h6>
              </td>

              {/* <3 BLN PROVIDE ORDER */}
              <td className="unresponsive">
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
              <td className="unresponsive">
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
              <td className="unresponsive">
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

              <td className="unresponsive">
                <h6>{total3BlnGrand}</h6>
                <p>{formatCurrency(totalRevenue3BlnGrand)}</p>
              </td>

              {/* >3 BLN PROVIDE ORDER */}
              <td className="unresponsive">
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
              <td className="unresponsive">
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
              <td className="unresponsive">
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
