const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const validWitels = ["BALI", "MALANG", "NUSA TENGGARA", "SIDOARJO", "SURAMADU"];

const witelMapping = {
  MALANG: "JATIM TIMUR",
  SIDOARJO: "JATIM BARAT",
};

const categoryMapping = {
  AO: ["New Install"],
  SO: ["Suspend"],
  DO: ["Disconnect"],
  MO: [
    "Modify",
    "Modify BA",
    "Modify Price",
    "Renewal Agreement",
    "Modify Termin",
  ],
  RO: ["Resume"],
};

function getCategory(orderSubtype) {
  for (const [category, subtypes] of Object.entries(categoryMapping)) {
    if (subtypes.includes(orderSubtype)) return category;
  }
  return "UNKNOWN";
}

function processReportData(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const result = jsonData.reduce((acc, row) => {
      const witel = row["BILL_WITEL"];
      if (!validWitels.includes(witel)) return acc;

      const witelRenamed = witelMapping[witel] || witel;

      if (!acc[witelRenamed]) {
        acc[witelRenamed] = {
          witelName: witelRenamed,
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

      const kategori = row["KATEGORI"];
      const kategoriUmur = row["KATEGORI_UMUR"];
      const orderId = row["LI_ID"];
      const itemName = row["STANDARD_NAME"];
      const itemRevenue = parseFloat(row["REVENUE"]) || 0;
      const orderSubtype = row["ORDER_SUBTYPE"];
      const category = getCategory(orderSubtype);

      if (kategori in acc[witelRenamed]) {
        const categoryData = acc[witelRenamed][kategori];

        const itemObject = {
          itemId: orderId,
          itemName: itemName || "Unknown",
          itemRevenue: itemRevenue,
          category: category,
        };

        if (kategoriUmur === "< 3 BLN") {
          categoryData["<3 BLN"]++;
          categoryData["revenue<3bln"] += itemRevenue;
          categoryData["<3blnItems"].push(itemObject);
        } else if (kategoriUmur === "> 3 BLN") {
          categoryData[">3 BLN"]++;
          categoryData["revenue>3bln"] += itemRevenue;
          categoryData[">3blnItems"].push(itemObject);
        }
      }

      acc[witelRenamed]["<3 BLN"] =
        acc[witelRenamed]["PROVIDE ORDER"]["<3 BLN"] +
        acc[witelRenamed]["IN PROCESS"]["<3 BLN"] +
        acc[witelRenamed]["READY TO BILL"]["<3 BLN"];

      acc[witelRenamed][">3 BLN"] =
        acc[witelRenamed]["PROVIDE ORDER"][">3 BLN"] +
        acc[witelRenamed]["IN PROCESS"][">3 BLN"] +
        acc[witelRenamed]["READY TO BILL"][">3 BLN"];

      return acc;
    }, {});

    return Object.values(result);
  } catch (error) {
    console.error("❌ Error processing report data:", error);
    throw error;
  }
}

module.exports = { processReportData };
