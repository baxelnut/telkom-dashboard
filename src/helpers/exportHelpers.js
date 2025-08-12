import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { hiddenCols } from "./tableHelper";

export const getExportOptions = () =>
  ["Excel", "CSV"].map((val) => ({
    value: val,
    label: val,
  }));

export const exportData = async (type, data, filename = "Data Preview") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }
  // Filter out hiddenCols keys for each row
  const filteredData = data.map((row) => {
    const newRow = {};
    Object.keys(row).forEach((key) => {
      if (!hiddenCols.includes(key)) {
        newRow[key] = row[key];
      }
    });
    return newRow;
  });
  const worksheet = XLSX.utils.json_to_sheet(filteredData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  if (type === "Excel") {
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${filename}.xlsx`);
  } else if (type === "CSV") {
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${filename}.csv`);
  }
};

// Normalize and trim filters
export function normalizeFilters(detailed) {
  const [sw, sp, spd, ss] = detailed.map((v) => (v ?? "").toString().trim());
  return {
    swNorm: sw ? sw.toUpperCase() : "ALL",
    spNorm: sp ? sp.toUpperCase() : "ALL",
    spdNorm: spd || "ALL",
    ssNorm: ss ? ss.toUpperCase() : "ALL",
    raw: { sw, sp, spd, ss },
  };
}

export function areFiltersActive({ swNorm, spNorm, spdNorm, ssNorm }) {
  return {
    witelFilterActive: swNorm !== "ALL",
    poFilterActive:
      spNorm !== "ALL" &&
      spNorm !== "ALL PO" &&
      spNorm !== "ALLPO" &&
      spNorm !== "",
    periodFilterActive: spdNorm !== "ALL" && spdNorm !== null && spdNorm !== "",
    statusFilterActive:
      ssNorm !== "ALL" && ssNorm !== "ALL STATUS" && ssNorm !== "",
  };
}

export function filterRows(enrichedData, filters, activeFilters) {
  const { swNorm, spNorm } = filters;
  const { witelFilterActive, poFilterActive } = activeFilters;

  return enrichedData.filter((r) => {
    const rowWitel = (r.WITEL || "").toString().trim().toUpperCase();
    if (witelFilterActive && rowWitel !== swNorm) return false;

    if (poFilterActive) {
      const poNameStr = Array.isArray(r.PO_NAME)
        ? r.PO_NAME.join(", ")
        : r.PO_NAME || "";
      const poEmailStr = Array.isArray(r.PO_EMAIL)
        ? r.PO_EMAIL.join(", ")
        : r.PO_EMAIL || "";

      const poNameNorm = poNameStr.toUpperCase();
      const poEmailNorm = poEmailStr.toUpperCase();

      if (!poNameNorm.includes(spNorm) && !poEmailNorm.includes(spNorm)) {
        return false;
      }
    }

    return true;
  });
}

export function filterItems(rows, filters, activeFilters) {
  const { spdNorm, ssNorm } = filters;
  const { periodFilterActive, statusFilterActive } = activeFilters;

  return rows
    .map((r) => {
      let items = Array.isArray(r.items) ? r.items.slice() : [];

      if (periodFilterActive) {
        if (spdNorm === "<3") items = items.filter((i) => i._bucket === "<");
        else if (spdNorm === ">3")
          items = items.filter((i) => i._bucket === ">");
      }

      if (statusFilterActive) {
        items = items.filter(
          (i) => (i.STATUS ?? "").toString().trim().toUpperCase() === ssNorm
        );
      }

      return {
        PO_EMAIL: Array.isArray(r.PO_EMAIL)
          ? r.PO_EMAIL.join(", ")
          : r.PO_EMAIL,
        PO_NAME: Array.isArray(r.PO_NAME) ? r.PO_NAME.join(", ") : r.PO_NAME,
        WITEL: r.WITEL,
        items,
      };
    })
    .filter((r) => Array.isArray(r.items) && r.items.length > 0);
}

export function flattenForExport(rows) {
  return rows.flatMap((r) =>
    r.items.map((i) => ({
      PO_EMAIL: r.PO_EMAIL,
      PO_NAME: r.PO_NAME,
      WITEL: r.WITEL,
      bucket: i._bucket === "<" ? "lt3" : "gt3",
      STATUS: i.STATUS,
      ...i,
    }))
  );
}

export function makeFilename(filters, activeFilters) {
  const { raw, spdNorm } = filters;
  const { witelFilterActive, poFilterActive, statusFilterActive } =
    activeFilters;
  const { sw, sp, ss } = raw;

  const dateOnly = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Jakarta",
  });

  let periodLabel = "all";
  if (spdNorm === "<3") periodLabel = "lt3";
  else if (spdNorm === ">3") periodLabel = "gt3";

  const filenamePO = poFilterActive
    ? (sp || "PO").replace(/[<>:"/\\|?*]/g, "_")
    : "ALL PO";
  const filenameWitel = witelFilterActive
    ? (sw || "WITEL").replace(/[<>:"/\\|?*]/g, "_")
    : "ALL WITEL";
  const filenameStatus = statusFilterActive
    ? (ss || "STATUS").replace(/[<>:"/\\|?*]/g, "_")
    : "ALL STATUS";

  return `${filenamePO}_${filenameWitel}_${periodLabel}BLN_${filenameStatus}_${dateOnly}`;
}
