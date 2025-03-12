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
      const witel = row["BILL_WITEL"];
      const kategoriUmur = row["KATEGORI_UMUR"];
      const kategori = row["KATEGORI"];
      const orderId = row["ORDER_ID"];
      const itemName = row["STANDARD_NAME"];
      const itemRevenue = parseFloat(row["REVENUE"]) || 0;

      if (!validWitels.includes(witel)) return acc;

      if (!acc[witel]) {
        acc[witel] = {
          witelName: witel,
          "<3 BLN": 0,
          ">3 BLN": 0,
          "PROVIDE ORDER": {
            "<3 BLN": 0,
            ">3 BLN": 0,
            "revenue<3bln": 0,
            "revenue>3bln": 0,
            "<3blnItems": [],
            ">3blnItems": [],
          },
          "IN PROCESS": {
            "<3 BLN": 0,
            ">3 BLN": 0,
            "revenue<3bln": 0,
            "revenue>3bln": 0,
            "<3blnItems": [],
            ">3blnItems": [],
          },
          "READY TO BILL": {
            "<3 BLN": 0,
            ">3 BLN": 0,
            "revenue<3bln": 0,
            "revenue>3bln": 0,
            "<3blnItems": [],
            ">3blnItems": [],
          },
        };
      }

      if (kategori in acc[witel]) {
        const categoryData = acc[witel][kategori];

        if (kategoriUmur === "< 3 BLN") {
          categoryData["<3 BLN"]++;
          categoryData["revenue<3bln"] += itemRevenue;
          categoryData["<3blnItems"].push({
            itemId: orderId,
            itemName: itemName || "Unknown",
            itemRevenue: itemRevenue,
          });
        } else if (kategoriUmur === "> 3 BLN") {
          categoryData[">3 BLN"]++;
          categoryData["revenue>3bln"] += itemRevenue;
          categoryData[">3blnItems"].push({
            itemId: orderId,
            itemName: itemName || "Unknown",
            itemRevenue: itemRevenue,
          });
        }
      }

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

    return Object.values(result);
  } catch (error) {
    console.error("❌ Error processing report data:", error);
    throw error;
  }
}

module.exports = { processReportData };
