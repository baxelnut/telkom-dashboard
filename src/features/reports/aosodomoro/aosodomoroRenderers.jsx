import { normalizeRevenue } from "../../../helpers/aosodomoroUtils";
import { formatCurrency } from "../../../helpers/formattingUtils";

export const renderRowCells = (
  entry,
  umurKey,
  orderSubtype2,
  selectedSubtypes,
  selectedSegmen,
  handleCellClick
) =>
  selectedSubtypes.map((subtype) => {
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

    const celltableData = {
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
        onClick={() => count > 0 && handleCellClick(celltableData)}
      >
        <h6>{count}</h6>
        <p>{count > 0 && formatCurrency(revenue)}</p>
      </td>
    );
  });

export const renderWitelTotalCells = (
  entry,
  umurKey,
  orderSubtype2,
  selectedSubtypes,
  selectedSegmen,
  handleCellClick
) => {
  const bucketNames =
    umurKey === "both" ? ["<3blnItems", ">3blnItems"] : [`${umurKey}3blnItems`];

  let allItems = [];
  selectedSubtypes.forEach((st) =>
    bucketNames.forEach((bk) => {
      const tableData = entry[st]?.[bk];
      if (tableData) allItems.push(...tableData);
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

  const celltableData = {
    witelName: entry.witelName,
    subType: null,
    subTypes: selectedSubtypes,
    kategoriUmur: umurKey === "both" ? "both3bln" : `${umurKey}3bln`,
    isTotal: true,
    extractedIds: filtered.map((i) => i.UUID),
  };

  return (
    <td
      key={`total-${entry.witelName}-${umurKey}`}
      className={count === 0 ? "disabled-cell" : ""}
      onClick={() => count > 0 && handleCellClick(celltableData)}
    >
      <h6>{count}</h6>
      <p>{count > 0 && formatCurrency(revenue)}</p>
    </td>
  );
};

export const renderReportCells = (
  umurKey,
  orderSubtype2,
  tableData,
  selectedSubtypes,
  selectedSegmen,
  handleCellClick
) =>
  selectedSubtypes.map((subtype) => {
    const bucket = `${umurKey}3blnItems`;
    const raw = tableData.flatMap((entry) => entry[subtype]?.[bucket] || []);

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

    const celltableData = {
      witelName: "ALL",
      subType: subtype,
      kategoriUmur: `${umurKey}3bln`,
      isTotal: true,
      extractedIds: filtered.map((i) => i.UUID),
    };

    return (
      <td
        key={`grand-${subtype}-${umurKey}`}
        className={count === 0 ? "disabled-cell" : ""}
        onClick={() => count > 0 && handleCellClick(celltableData)}
      >
        <h6>{count}</h6>
        <p>{count > 0 && formatCurrency(revenue)}</p>
      </td>
    );
  });

export const renderGrandTotals = (
  umurKey,
  orderSubtype2,
  tableData,
  selectedSubtypes,
  selectedSegmen,
  handleCellClick
) => {
  const bucketNames =
    umurKey === "both" ? ["<3blnItems", ">3blnItems"] : [`${umurKey}3blnItems`];

  const raw = tableData.flatMap((entry) =>
    selectedSubtypes.flatMap((st) =>
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

  const celltableData = {
    witelName: "ALL",
    subType: null,
    subTypes: selectedSubtypes,
    kategoriUmur: `${umurKey}3bln`,
    isTotal: true,
    extractedIds: filtered.map((i) => i.UUID),
  };

  return (
    <td
      key={`grand-total-${umurKey}`}
      className={count === 0 ? "disabled-cell" : ""}
      onClick={() => count > 0 && handleCellClick(celltableData)}
    >
      <h6>{count}</h6>
      <p>{count > 0 && formatCurrency(revenue)}</p>
    </td>
  );
};
