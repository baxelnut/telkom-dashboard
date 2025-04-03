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
  if (loading) return <Loading backgroundColor="transparent" />;
  if (error) return <Error />;

  const [selectedCell, setSelectedCell] = useState(null);

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

  const renderRowCells = (entry, umurKey) => {
    return orderSubtypes.map((subtype, idx) => {
      const filteredItems = entry?.[subtype]?.[`${umurKey}3blnItems`]?.filter(
        (item) =>
          selectedCategory === "ALL" ||
          selectedCategory === item["order_subtype"]
      );

      const count = filteredItems?.length || 0;
      const revenue = filteredItems?.reduce(
        (totalRevenue, item) => totalRevenue + (item.revenue || 0),
        0
      );

      const formattedRevenue = formatCurrency(revenue);
      const orderSubtypeList =
        filteredItems?.map((item) => item["order_subtype"]).join(", ") || null;

      const isDisabled = count === 0;
      const cellData = {
        witelName: entry.witelName,
        id: `${subtype}-kategori_umur_${umurKey}3bln`,
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
          <p>{orderSubtypeList ? formattedRevenue : null}</p>
        </td>
      );
    });
  };

  const renderTotalCells = (entry, umurKey) => {
    let totalCount = 0;
    let totalRevenue = 0;

    orderSubtypes.forEach((subtype) => {
      const itemData = entry?.[subtype]?.[`${umurKey}3blnItems`] || [];

      const filteredItems = itemData.filter((item) => {
        return (
          selectedCategory === "ALL" ||
          selectedCategory === item["order_subtype"]
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

  const renderGrandTotalCells = (entry) => {
    let totalCount = 0;
    let totalRevenue = 0;

    ["<3blnItems", ">3blnItems"].forEach((kategoriUmurKey) => {
      orderSubtypes.forEach((subtype) => {
        const itemData = entry?.[subtype]?.[kategoriUmurKey] || [];

        const filteredItems = itemData.filter((item) => {
          return (
            selectedCategory === "ALL" ||
            selectedCategory === item["order_subtype"]
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

  const renderReportCells = (umurKey) => {
    return orderSubtypes.map((grandItem, grandIndex) => {
      const totalCount = reportTableData["data"].reduce((totalCount, data) => {
        const items = data[grandItem]?.[`${umurKey}3blnItems`] || [];
        const filteredItems = items.filter(
          (item) =>
            selectedCategory === "ALL" ||
            selectedCategory === item["order_subtype"]
        );
        return totalCount + filteredItems.length;
      }, 0);
      const totalRevenue = reportTableData["data"].reduce(
        (totalRevenue, data) => {
          const items = data[grandItem]?.[`${umurKey}3blnItems`] || [];
          const filteredItems = items.filter(
            (item) =>
              selectedCategory === "ALL" ||
              selectedCategory === item["order_subtype"]
          );
          const revenueSum = filteredItems.reduce(
            (sum, item) => sum + (item.revenue || 0),
            0
          );
          return totalRevenue + revenueSum;
        },
        0
      );

      return (
        <td key={grandIndex} className="unresponsive">
          <h6>{totalCount}</h6>
          <p>{formatCurrency(totalRevenue)}</p>
        </td>
      );
    });
  };

  const renderGrandTotals = (umurKey) => {
    const totalCountAndRevenue = reportTableData["data"].reduce(
      (acc, data) => {
        const keysToCheck =
          umurKey === "both"
            ? ["<3blnItems", ">3blnItems"]
            : [`${umurKey}3blnItems`];

        keysToCheck.forEach((key) => {
          orderSubtypes.forEach((grandItem) => {
            const items = data[grandItem]?.[key] || [];
            const filteredItems = items.filter(
              (item) =>
                selectedCategory === "ALL" ||
                selectedCategory === item["order_subtype"]
            );
            acc.totalCount += filteredItems.length;
            acc.totalRevenue += filteredItems.reduce(
              (sum, item) => sum + (item.revenue || 0),
              0
            );
          });
        });

        return acc;
      },
      { totalCount: 0, totalRevenue: 0 }
    );

    return (
      <td className="unresponsive">
        <h6>{totalCountAndRevenue.totalCount}</h6>
        <p>{formatCurrency(totalCountAndRevenue.totalRevenue)}</p>
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
                  {renderRowCells(entry, "<")}
                  {renderTotalCells(entry, "<")}
                  {renderRowCells(entry, ">")}
                  {renderTotalCells(entry, ">")}
                  {renderGrandTotalCells(entry)}
                </tr>
              );
            })}

            <tr className="grand-total-row">
              <td className="grand-total-title">
                <h6>GRAND TOTAL</h6>
              </td>
              {renderReportCells("<")}
              {renderGrandTotals("<")}
              {renderReportCells(">")}
              {renderGrandTotals(">")}
              {renderGrandTotals("both")}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
