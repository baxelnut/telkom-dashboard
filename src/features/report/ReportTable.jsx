import React, { useState } from "react";
import "./ReportTable.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

const formatCurrency = (value) =>
  value ? `Rp${value.toLocaleString("id-ID")}` : "Rp0";

export default function ReportTable({
  reportTableData,
  selectedCategory,
  selectedPeriod,
  orderSubtypes,
  loading,
  error,
  onCellSelect,
}) {
  if (loading) return <Loading backgroundColor="transparent" />;
  if (error) return <Error />;
  if (!orderSubtypes || orderSubtypes.length === 0)
    return (
      <p>No data to be displayed. Please choose at least one order subtype.</p>
    );

  const [selectedCell, setSelectedCell] = useState(null);
  const handleCellClick = (cellData) => {
    const { witelName, selectedCellId } = cellData;
    const [mainCategory, subCategory] = selectedCellId.split("-");

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
    const extractedCategory = selectedCategory;

    const updatedCellData = { ...cellData, extractedIds, extractedCategory };

    setSelectedCell(updatedCellData);
    onCellSelect(updatedCellData);
  };

  const processData = (entry, umurKeys) => {
    let totalCount = 0;
    let totalRevenue = 0;

    umurKeys.forEach((umurKey) => {
      orderSubtypes.forEach((subtype) => {
        const items = entry?.[subtype]?.[umurKey] || [];
        const filteredItems = items.filter(
          (item) =>
            selectedCategory === "ALL" ||
            selectedCategory === item["order_subtype"]
        );

        totalCount += filteredItems.length;
        totalRevenue += filteredItems.reduce(
          (sum, item) => sum + (item.revenue || 0),
          0
        );
      });
    });

    return { totalCount, totalRevenue };
  };

  const renderCells = (entry, umurKey) => {
    const umurKeys =
      umurKey === "both"
        ? ["<3blnItems", ">3blnItems"]
        : [`${umurKey}3blnItems`];
    const { totalCount, totalRevenue } = processData(entry, umurKeys);

    return (
      <td className="unresponsive">
        <h6>{totalCount}</h6>
        <p>{formatCurrency(totalRevenue)}</p>
      </td>
    );
  };

  const renderRowCells = (entry, umurKey) => {
    return orderSubtypes.map((subtype, idx) => {
      const key = `${umurKey}3blnItems`;
      const filteredItems = entry?.[subtype]?.[key]?.filter(
        (item) =>
          selectedCategory === "ALL" ||
          selectedCategory === item["order_subtype"]
      );

      const count = filteredItems?.length || 0;
      const revenue = filteredItems?.reduce(
        (total, item) => total + (item.revenue || 0),
        0
      );
      const formattedRevenue = formatCurrency(revenue);
      const orderSubtypeList =
        filteredItems?.map((item) => item["order_subtype"]).join(", ") || null;

      const isDisabled = count === 0;
      const cellData = {
        witelName: entry.witelName,
        subType: subtype,
        kategoriUmur: `${umurKey}3bln`,
        selectedCellId: `${subtype}-kategori_umur_${umurKey}3bln`,
      };

      const isSelected =
        selectedCell &&
        selectedCell.witelName === entry.witelName &&
        selectedCell.subType === cellData.subType &&
        selectedCell.kategoriUmur === cellData.kategoriUmur;

      return (
        <td
          key={idx}
          className={`${isDisabled ? "disabled-cell" : ""} ${
            isSelected ? "selected-cell" : ""
          }`}
          onClick={() => !isDisabled && handleCellClick(cellData)}
        >
          <h6>{orderSubtypeList ? count : 0}</h6>
          <p>{count == 0 ? null : formattedRevenue}</p>
        </td>
      );
    });
  };

  const renderReportCells = (umurKey) => {
    return orderSubtypes.map((grandItem, grandIndex) => {
      const { totalCount, totalRevenue } = reportTableData["data"].reduce(
        (acc, data) => {
          const key = `${umurKey}3blnItems`;
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
          return acc;
        },
        { totalCount: 0, totalRevenue: 0 }
      );

      return (
        <td key={grandIndex} className="unresponsive">
          <h6>{totalCount}</h6>
          <p>{totalCount == 0 ? null : formatCurrency(totalRevenue)}</p>
        </td>
      );
    });
  };

  const renderGrandTotals = (umurKey) => {
    const keysToCheck =
      umurKey === "both"
        ? ["<3blnItems", ">3blnItems"]
        : [`${umurKey}3blnItems`];
    const { totalCount, totalRevenue } = reportTableData["data"].reduce(
      (acc, data) => {
        const result = processData(data, keysToCheck);
        acc.totalCount += result.totalCount;
        acc.totalRevenue += result.totalRevenue;
        return acc;
      },
      { totalCount: 0, totalRevenue: 0 }
    );

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
              <th rowSpan="2">
                <h6>WITEL</h6>
              </th>
              <th colSpan={orderSubtypes.length}>
                <h6>&lt;3 BLN</h6>
              </th>
              <th rowSpan="2">
                &lt;<h6>3 BLN Total</h6>
              </th>
              <th colSpan={orderSubtypes.length}>
                <h6>&gt;3 BLN</h6>
              </th>
              <th rowSpan="2">
                <h6>&gt;3 BLN Total</h6>
              </th>
              <th rowSpan="2">
                <h6>Grand Total</h6>
              </th>
            </tr>
            <tr>
              {orderSubtypes.map((label, index) => (
                <th key={index}>
                  <h6>{label}</h6>
                </th>
              ))}
              {orderSubtypes.map((label, index) => (
                <th key={index}>
                  <h6>{label}</h6>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {reportTableData["data"].map((entry, index) => (
              <tr key={index}>
                <td className="unresponsive">
                  <h6>{entry?.witelName}</h6>
                </td>
                {renderRowCells(entry, "<")}
                {renderCells(entry, "<")}
                {renderRowCells(entry, ">")}
                {renderCells(entry, ">")}
                {renderCells(entry, "both")}
              </tr>
            ))}

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
