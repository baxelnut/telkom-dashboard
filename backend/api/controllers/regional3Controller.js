import dotenv from "dotenv";
dotenv.config();

import { splitByPeriod } from "../utils/splitByPeriod.js";

const { SPREADSHEET_ID, FORMATTED_GID } = process.env;

const BIG_5_REGIONS = [
  "BALI",
  "JATIM BARAT", // "MALANG",
  "NUSA TENGGARA",
  "JATIM TIMUR", // "SIDOARJO",
  "SURAMADU",
];

const isBig5Region = (region) => {
  if (typeof region !== "string" || region.trim() === "") {
    return "N/A";
  }

  const upperRegion = region.toUpperCase().trim();
  return BIG_5_REGIONS.includes(upperRegion) ? upperRegion : "N/A";
};

const processData = (data) => {
  const groupedByWitel = groupBy(data, "NEW_WITEL");

  return Object.keys(groupedByWitel)
    .map((witelName) => {
      if (!isBig5Region(witelName)) return null;
      const witelData = groupedByWitel[witelName];

      const kategoriData = {};
      const categories = [...new Set(witelData.map((i) => i["KATEGORI"]))];

      categories.forEach((kategori) => {
        if (kategori === "IN PROCESS") {
          const inProcItems = witelData.filter(
            (i) => i["KATEGORI"] === "IN PROCESS"
          );
          kategoriData[kategori] = splitByPeriod(inProcItems);
        } else {
          kategoriData[kategori] = processKategoriData(witelData, kategori);
        }
      });

      return { witelName, ...kategoriData };
    })
    .filter(Boolean);
};

const groupBy = (data, field) => {
  return data.reduce((result, item) => {
    const key = item[field];
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
};

const processKategoriData = (witelData, kategori) => {
  const kategoriCounts = { "<3bln": 0, ">3bln": 0 };
  const revenueCounts = { "<3bln": 0, ">3bln": 0 };
  const items = { "<3bln": [], ">3bln": [] };

  witelData.forEach((item) => {
    const currentKategori = item["KATEGORI"];
    const kategoriUmur = item["KATEGORI_UMUR"];

    let rawRevenue = item["REVENUE"];

    // Set revenue to 0 if it's null, NaN, or empty
    let revenue = rawRevenue;
    if (
      rawRevenue === null ||
      rawRevenue === "" ||
      isNaN(parseFloat(rawRevenue))
    ) {
      revenue = 0;
    } else {
      revenue = parseFloat(rawRevenue);
    }

    if (currentKategori === kategori) {
      if (kategoriUmur === "< 3 BLN") {
        kategoriCounts["<3bln"] += 1;
        revenueCounts["<3bln"] += revenue;
        items["<3bln"].push({
          ...item,
        });
      } else if (kategoriUmur === "> 3 BLN") {
        kategoriCounts[">3bln"] += 1;
        revenueCounts[">3bln"] += revenue;
        items[">3bln"].push({
          ...item,
        });
      }
    }
  });

  return {
    [`kategori_umur_<3bln`]: kategoriCounts["<3bln"],
    [`kategori_umur_>3bln`]: kategoriCounts[">3bln"],
    [`revenue_<3bln`]: revenueCounts["<3bln"],
    [`revenue_>3bln`]: revenueCounts[">3bln"],
    [`<3blnItems`]: items["<3bln"],
    [`>3blnItems`]: items[">3bln"],
  };
};

export const fetchFormattedReportData = async () => {
  const sheetURL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${FORMATTED_GID}`;

  const response = await fetch(sheetURL);
  const text = await response.text();
  const json = JSON.parse(text.substring(47).slice(0, -2));

  const cols = json.table.cols.map((col) => col.label || `col_${col.id}`);

  const rows = json.table.rows.map((row) => {
    const obj = {};
    row.c.forEach((cell, index) => {
      obj[cols[index]] = cell?.v || null;
    });
    return obj;
  });

  const filteredRows = rows.filter((row) => isBig5Region(row["NEW_WITEL"]));

  return filteredRows;
};

export const getReg3ReportData = async (req, res) => {
  try {
    const rawData = await fetchFormattedReportData();
    const processedData = processData(rawData);

    res.json({
      data: processedData,
      totalRawData: rawData.length,
      totalProcessedData: processedData.length,
    });
  } catch (err) {
    console.error("🔥 Failed to fetch sheet:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const fetchInProcessData = async () => {
  const sheetURL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${FORMATTED_GID}`;

  const response = await fetch(sheetURL);
  const text = await response.text();
  const json = JSON.parse(text.substring(47).slice(0, -2));

  const cols = json.table.cols.map((col) => col.label || `col_${col.id}`);
  const rows = json.table.rows.map((row) => {
    const obj = {};
    row.c.forEach((cell, index) => {
      obj[cols[index]] = cell?.v || null;
    });
    return obj;
  });

  const normalize = (str) => str?.replace(/\s+/g, " ").trim().toUpperCase();
  const inProcessRows = rows.filter(
    (row) => normalize(row["KATEGORI"]) === "IN PROCESS"
  );

  return inProcessRows;
};

export const getReg3InProcessData = async (req, res) => {
  try {
    const inProcessData = await fetchInProcessData();
    res.json({
      data: inProcessData,
      totalRawData: inProcessData.length,
    });
  } catch (err) {
    console.error("🔥 Failed to fetch sheet:", err.message);
    res.status(500).json({ error: err.message });
  }
};
