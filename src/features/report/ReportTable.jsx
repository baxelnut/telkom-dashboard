import React, { useState } from "react";
import "./ReportTable.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

const formatCurrency = (value) =>
  value ? `Rp${value.toLocaleString("id-ID")}` : "Rp0";

export default function ReportTable({
  reportTableData,
  selectedCategory,
  orderSubtypes,
  loading,
  error,
  onCellSelect,
}) {
  if (loading) return <Loading backgroundColor="transparent" />;
  if (error) return <Error message={error} />;
  if (!orderSubtypes.length)
    return <p>Please select at least one order subtype.</p>;

  const [selectedCell, setSelectedCell] = useState(null);

  const handleCellClick = (cellData) => {
    setSelectedCell(cellData);
    onCellSelect(cellData);
  };

  const renderRowCells = (entry, umurKey) =>
    orderSubtypes.map((subtype) => {
      const bucket = `${umurKey}3blnItems`;
      const allItems = entry[subtype]?.[bucket] || [];
      const filtered = allItems.filter(
        (i) =>
          selectedCategory === "ALL" || i.ORDER_SUBTYPE2 === selectedCategory
      );
      const count = filtered.length;
      const revenue = filtered.reduce((sum, i) => sum + (i.REVENUE || 0), 0);

      const cellData = {
        witelName: entry.witelName,
        subType: subtype,
        kategoriUmur: `${umurKey}3bln`,
        isTotal: false,
        extractedIds: filtered.map((i) => i.id),
      };

      return (
        <td
          key={`${entry.witelName}-${subtype}-${umurKey}`}
          className={count === 0 ? "disabled-cell" : ""}
          onClick={() => count > 0 && handleCellClick(cellData)}
        >
          <h6>{count}</h6>
          <p>{count > 0 && formatCurrency(revenue)}</p>
        </td>
      );
    });

  const renderWitelTotalCells = (entry, umurKey) => {
    const bucketNames =
      umurKey === "both"
        ? ["<3blnItems", ">3blnItems"]
        : [`${umurKey}3blnItems`];

    let allItems = [];
    orderSubtypes.forEach((st) =>
      bucketNames.forEach((bk) => allItems.push(...(entry[st]?.[bk] || [])))
    );

    const filtered = allItems.filter(
      (i) => selectedCategory === "ALL" || i.ORDER_SUBTYPE2 === selectedCategory
    );
    const count = filtered.length;
    const revenue = filtered.reduce((s, i) => s + (i.REVENUE || 0), 0);

    const cellData = {
      witelName: entry.witelName,
      subType: null,
      subTypes: orderSubtypes,
      kategoriUmur: `${umurKey}3bln`,
      isTotal: true,
      extractedIds: filtered.map((i) => i.id),
    };

    return (
      <td
        key={`total-${entry.witelName}-${umurKey}`}
        className={count === 0 ? "disabled-cell" : ""}
        onClick={() => count > 0 && handleCellClick(cellData)}
      >
        <h6>{count}</h6>
        <p>{count > 0 && formatCurrency(revenue)}</p>
      </td>
    );
  };

  const renderReportCells = (umurKey) =>
    orderSubtypes.map((subtype) => {
      const bucket = `${umurKey}3blnItems`;
      const raw = reportTableData.data.flatMap(
        (entry) => entry[subtype]?.[bucket] || []
      );
      const filtered = raw.filter(
        (i) =>
          selectedCategory === "ALL" || i.ORDER_SUBTYPE2 === selectedCategory
      );
      const count = filtered.length;
      const revenue = filtered.reduce((s, i) => s + (i.REVENUE || 0), 0);

      const cellData = {
        witelName: "ALL",
        subType: subtype,
        kategoriUmur: `${umurKey}3bln`,
        isTotal: true,
        extractedIds: filtered.map((i) => i.id),
      };

      return (
        <td
          key={`grand-${subtype}-${umurKey}`}
          className="unresponsive"
          onClick={() => count > 0 && handleCellClick(cellData)}
        >
          <h6>{count}</h6>
          <p>{count > 0 && formatCurrency(revenue)}</p>
        </td>
      );
    });

  const renderGrandTotals = (umurKey) => {
    const bucketNames =
      umurKey === "both"
        ? ["<3blnItems", ">3blnItems"]
        : [`${umurKey}3blnItems`];

    const raw = reportTableData.data.flatMap((entry) =>
      orderSubtypes.flatMap((st) =>
        bucketNames.flatMap((bk) => entry[st]?.[bk] || [])
      )
    );
    const filtered = raw.filter(
      (i) => selectedCategory === "ALL" || i.ORDER_SUBTYPE2 === selectedCategory
    );
    const count = filtered.length;
    const revenue = filtered.reduce((s, i) => s + (i.REVENUE || 0), 0);

    const cellData = {
      witelName: "ALL",
      subType: null,
      subTypes: orderSubtypes,
      kategoriUmur: `${umurKey}3bln`,
      isTotal: true,
      extractedIds: filtered.map((i) => i.id),
    };

    return (
      <td
        key={`grand-total-${umurKey}`}
        className="unresponsive"
        onClick={() => count > 0 && handleCellClick(cellData)}
      >
        <h6>{count}</h6>
        <p>{count > 0 && formatCurrency(revenue)}</p>
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
                &gt;<h6>3 BLN Total</h6>
              </th>
              <th rowSpan="2">
                <h6>Grand Total</h6>
              </th>
            </tr>
            <tr>
              {orderSubtypes.map((st) => (
                <th key={`h1-${st}`}>
                  <h6>{st}</h6>
                </th>
              ))}
              {orderSubtypes.map((st) => (
                <th key={`h2-${st}`}>
                  <h6>{st}</h6>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportTableData.data.map((entry) => (
              <tr key={entry.witelName}>
                <td className="unresponsive">
                  <h6>{entry.witelName}</h6>
                </td>
                {renderRowCells(entry, "<")}
                {renderWitelTotalCells(entry, "<")}
                {renderRowCells(entry, ">")}
                {renderWitelTotalCells(entry, ">")}
                {renderWitelTotalCells(entry, "both")}
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
