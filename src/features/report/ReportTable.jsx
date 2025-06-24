import React, { useState } from "react";
import "./ReportTable.css";
import Loading from "../../components/utils/Loading";
import Error from "../../components/utils/Error";

const formatCurrency = (value) => {
  if (!value || isNaN(value)) return "Rp0";

  const absValue = Math.abs(value).toLocaleString("id-ID");
  return value < 0 ? `-Rp${absValue}` : `Rp${absValue}`;
};

const normalizeRevenue = (i) => {
  if (!i || typeof i !== "object") return 0;
  return ["SO", "DO"].includes(i.ORDER_SUBTYPE2) ? -i.REVENUE : i.REVENUE;
};

export default function ReportTable({
  reportTableData,
  selectedSegmen,
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

  const renderRowCells = (entry, umurKey, orderSubtype2) =>
    orderSubtypes.map((subtype) => {
      const bucket = `${umurKey}3blnItems`;
      const allItems = entry[subtype]?.[bucket] || [];

      const filtered = allItems.filter(
        (i) =>
          (selectedSegmen === "ALL" || i.SEGMEN === selectedSegmen) &&
          (orderSubtype2 === "ALL" || i.ORDER_SUBTYPE2 === orderSubtype2)
      );

      const count = filtered.length;
      const revenue = filtered.reduce(
        (sum, i) => sum + normalizeRevenue(i || 0),
        0
      );

      const cellData = {
        witelName: entry.witelName,
        subType: subtype,
        kategoriUmur: `${umurKey}3bln`,
        isTotal: false,
        extractedIds: filtered.map((i) => i.UUID),
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

  const renderWitelTotalCells = (entry, umurKey, orderSubtype2) => {
    const bucketNames =
      umurKey === "both"
        ? ["<3blnItems", ">3blnItems"]
        : [`${umurKey}3blnItems`];

    let allItems = [];
    orderSubtypes.forEach((st) =>
      bucketNames.forEach((bk) => {
        const data = entry[st]?.[bk];
        if (data) allItems.push(...data);
      })
    );

    const filtered = allItems.filter(
      (i) =>
        (selectedSegmen === "ALL" || i.SEGMEN === selectedSegmen) &&
        (orderSubtype2 === "ALL" || i.ORDER_SUBTYPE2 === orderSubtype2)
    );

    const count = filtered.length;
    const revenue = filtered.reduce(
      (sum, i) => sum + normalizeRevenue(i || 0),
      0
    );

    const cellData = {
      witelName: entry.witelName,
      subType: null,
      subTypes: orderSubtypes,
      kategoriUmur: umurKey === "both" ? "both3bln" : `${umurKey}3bln`,
      isTotal: true,
      extractedIds: filtered.map((i) => i.UUID),
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

  const renderReportCells = (umurKey, orderSubtype2) =>
    orderSubtypes.map((subtype) => {
      const bucket = `${umurKey}3blnItems`;
      const raw = reportTableData.data.flatMap(
        (entry) => entry[subtype]?.[bucket] || []
      );

      const filtered = raw.filter(
        (i) =>
          (selectedSegmen === "ALL" || i.SEGMEN === selectedSegmen) &&
          (orderSubtype2 === "ALL" || i.ORDER_SUBTYPE2 === orderSubtype2)
      );

      const count = filtered.length;
      const revenue = filtered.reduce(
        (sum, i) => sum + normalizeRevenue(i || 0),
        0
      );

      const cellData = {
        witelName: "ALL",
        subType: subtype,
        kategoriUmur: `${umurKey}3bln`,
        isTotal: true,
        extractedIds: filtered.map((i) => i.UUID),
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

  const renderGrandTotals = (umurKey, orderSubtype2) => {
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
      (i) =>
        (selectedSegmen === "ALL" || i.SEGMEN === selectedSegmen) &&
        (orderSubtype2 === "ALL" || i.ORDER_SUBTYPE2 === orderSubtype2)
    );

    const count = filtered.length;
    const revenue = filtered.reduce(
      (sum, i) => sum + normalizeRevenue(i || 0),
      0
    );

    const cellData = {
      witelName: "ALL",
      subType: null,
      subTypes: orderSubtypes,
      kategoriUmur: `${umurKey}3bln`,
      isTotal: true,
      extractedIds: filtered.map((i) => i.UUID),
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
                <h6>&lt;3 BLN Total</h6>
              </th>
              <th colSpan={orderSubtypes.length}>
                <h6>&gt;3 BLN</h6>
              </th>
              <th rowSpan="2">
                <h6>&gt;3 BLN Total</h6>
              </th>
              <th rowSpan="2">
                <h6>GRAND TOTAL</h6>
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
            {["AO", "SO", "DO", "MO", "RO"].map((orderType) => (
              <React.Fragment key={orderType}>
                <tr className="aosodomorow-row">
                  <td>
                    <h6>{orderType}</h6>
                  </td>
                  {renderReportCells("<", orderType)}
                  {renderGrandTotals("<", orderType)}
                  {renderReportCells(">", orderType)}
                  {renderGrandTotals(">", orderType)}
                  {renderGrandTotals("both", orderType)}
                </tr>

                {reportTableData.data.map((entry) => (
                  <tr key={entry.witelName || `WITEL_NA_${entryIndex}`}>
                    <td className="unresponsive">
                      <h6>
                        {!entry.witelName || entry.witelName === "null"
                          ? "N/A"
                          : entry.witelName}
                      </h6>
                    </td>
                    {renderRowCells(entry, "<", orderType)}
                    {renderWitelTotalCells(entry, "<", orderType)}
                    {renderRowCells(entry, ">", orderType)}
                    {renderWitelTotalCells(entry, ">", orderType)}
                    {renderWitelTotalCells(entry, "both", orderType)}
                  </tr>
                ))}
              </React.Fragment>
            ))}

            <tr className="grand-total-row">
              <td className="grand-total-title">
                <h6>GRAND TOTAL</h6>
              </td>
              {renderReportCells("<", "ALL")}
              {renderGrandTotals("<", "ALL")}
              {renderReportCells(">", "ALL")}
              {renderGrandTotals(">", "ALL")}
              {renderGrandTotals("both", "ALL")}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
