const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const validWitels = ["BALI", "MALANG", "NUSA TENGGARA", "SIDOARJO", "SURAMADU"];

function processReportData(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const result = jsonData.reduce((acc, row) => {
      const witel = row["SERVICE_WITEL"];
      const kategoriUmur = row["KATEGORI_UMUR"];
      const kategori = row["KATEGORI"];
      const revenue = parseFloat(row["REVENUE"]) || 0;

      if (!validWitels.includes(witel)) return acc;

      if (!acc[witel]) {
        acc[witel] = {
          "<3 bulan": 0,
          ">3 bulan": 0,
          "PROVIDE ORDER": { count: 0, revenue: 0 },
          "IN PROCESS": { count: 0, revenue: 0 },
          "READY TO BILL": { count: 0, revenue: 0 },
        };
      }

      if (kategoriUmur === "< 3 BLN") acc[witel]["<3 bulan"]++;
      if (kategoriUmur === "> 3 BLN") acc[witel][">3 bulan"]++;

      if (kategori in acc[witel]) {
        acc[witel][kategori].count++;
        acc[witel][kategori].revenue += revenue;
      }

      return acc;
    }, {});

    return result;
  } catch (error) {
    console.error("❌ Error processing report data:", error);
    throw error;
  }
}

module.exports = { processReportData };
