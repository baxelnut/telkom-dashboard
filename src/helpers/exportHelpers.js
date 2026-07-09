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
    // Normalize row values once
    const rowWitel = (r.WITEL || "").toString().trim().toUpperCase();

    const poNameStr = Array.isArray(r.PO_NAME)
      ? r.PO_NAME.join(", ")
      : r.PO_NAME || "";
    const poEmailStr = Array.isArray(r.PO_EMAIL)
      ? r.PO_EMAIL.join(", ")
      : r.PO_EMAIL || "";

    const poNameNorm = poNameStr.toString().toUpperCase();
    const poEmailNorm = poEmailStr.toString().toUpperCase();

    // If PO filter active => match PO (by name or email) and ignore WITEL
    if (poFilterActive) {
      if (!poNameNorm.includes(spNorm) && !poEmailNorm.includes(spNorm)) {
        return false;
      }
      return true; // PO matched, keep this row regardless of WITEL
    }
    // otherwise, enforce WITEL filter if active
    if (witelFilterActive && rowWitel !== swNorm) return false;

    return true;
  });
}

export function filterItems(rows, filters, activeFilters) {
  const { spdNorm, ssNorm } = filters;
  const { periodFilterActive, statusFilterActive } = activeFilters;

  return rows
    .map((r) => {
      let items = Array.isArray(r.items) ? r.items.slice() : [];

      // Normalize PO identifiers once
      const poNameNorm = (
        Array.isArray(r.PO_NAME) ? r.PO_NAME.join(", ") : r.PO_NAME || ""
      )
        .toString()
        .trim()
        .toUpperCase();
      const poEmailNorm = (
        Array.isArray(r.PO_EMAIL) ? r.PO_EMAIL.join(", ") : r.PO_EMAIL || ""
      )
        .toString()
        .trim()
        .toUpperCase();

      // Filter by PO only if PO filter is NOT active, otherwise filter by selected PO at higher level
      items = items.filter((i) => {
        const picNorm = (i.PIC || "").toString().trim().toUpperCase();
        // Match PIC to PO_NAME or PO_EMAIL for this row
        return (
          picNorm === poNameNorm ||
          picNorm === poEmailNorm ||
          picNorm.includes(poNameNorm) ||
          picNorm.includes(poEmailNorm)
        );
      });

      if (periodFilterActive) {
        if (spdNorm === "<2") items = items.filter((i) => i._bucket === "<");
        else if (spdNorm === ">2")
          items = items.filter((i) => i._bucket === ">");
      }

      if (statusFilterActive) {
        items = items.filter(
          (i) => (i.STATUS ?? "").toString().trim().toUpperCase() === ssNorm,
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
      bucket: i._bucket === "<" ? "lt2" : "gt2",
      STATUS: i.STATUS,
      ...i,
    })),
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
  if (spdNorm === "<2") periodLabel = "lt2";
  else if (spdNorm === ">2") periodLabel = "gt2";

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

export function dedupeByKey(
  arr,
  keyCandidates = ["UUID", "ORDER_ID", "LI_SID"],
) {
  const seen = new Map();
  for (const item of arr) {
    // find first available key value
    let k;
    for (const key of keyCandidates) {
      if (
        item[key] !== undefined &&
        item[key] !== null &&
        `${item[key]}`.trim() !== ""
      ) {
        k = `${key}:${item[key]}`;
        break;
      }
    }
    // fallback to serialized unique content (less ideal)
    if (!k) {
      k = JSON.stringify([
        item.PO_NAME ?? "",
        item.LI_SID ?? "",
        item.ORDER_ID ?? "",
        item.NIPNAS ?? "",
      ]);
    }
    if (!seen.has(k)) seen.set(k, item);
  }
  return Array.from(seen.values());
}
