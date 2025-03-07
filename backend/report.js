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
          "<3 BLN": 0,
          ">3 BLN": 0,
          "PROVIDE ORDER": { "<3 BLN": 0, ">3 BLN": 0, revenue: 0 },
          "IN PROCESS": { "<3 BLN": 0, ">3 BLN": 0, revenue: 0 },
          "READY TO BILL": { "<3 BLN": 0, ">3 BLN": 0, revenue: 0 },
        };
      }

      if (kategori in acc[witel]) {
        if (kategoriUmur === "< 3 BLN") {
          acc[witel][kategori]["<3 BLN"]++; // Count orders in this category for <3 BLN
          acc[witel][kategori].revenue += revenue;
        } else if (kategoriUmur === "> 3 BLN") {
          acc[witel][kategori][">3 BLN"]++; // Count orders in this category for >3 BLN
          acc[witel][kategori].revenue += revenue;
        }
      }

      // Total each category for <3 BLN and >3 BLN
      acc[witel]["<3 BLN"] =
        acc[witel]["PROVIDE ORDER"]["<3 BLN"] +
        acc[witel]["IN PROCESS"]["<3 BLN"] +
        acc[witel]["READY TO BILL"]["<3 BLN"];

      acc[witel][">3 BLN"] =
        acc[witel]["PROVIDE ORDER"][">3 BLN"] +
        acc[witel]["IN PROCESS"][">3 BLN"] +
        acc[witel]["READY TO BILL"][">3 BLN"];

      return acc;
    }, {});

    // console.log("🚀 Processed Data:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("❌ Error processing report data:", error);
    throw error;
  }
}

module.exports = { processReportData };
