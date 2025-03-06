const XLSX = require("xlsx");

function processExcelData(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const validWitels = [
      "BALI",
      "MALANG",
      "NUSA TENGGARA",
      "SIDOARJO",
      "SURAMADU",
    ];

    jsonData = jsonData.filter((row) => validWitels.includes(row.BILL_WITEL));

    const result = {};

    jsonData.forEach(({ BILL_WITEL, KATEGORI }) => {
      if (!result[BILL_WITEL]) {
        result[BILL_WITEL] = {
          witelName: BILL_WITEL,
          provideOrder: 0,
          inProcess: 0,
          provComplete: 0,
          readyToBill: 0,
          billComplete: 0,
        };
      }

      switch (KATEGORI) {
        case "PROVIDE ORDER":
          result[BILL_WITEL].provideOrder += 1;
          break;
        case "IN PROCESS":
          result[BILL_WITEL].inProcess += 1;
          break;
        case "PROV. COMPLETE":
          result[BILL_WITEL].provComplete += 1;
          break;
        case "READY TO BILL":
          result[BILL_WITEL].readyToBill += 1;
          break;
        case "BILLING COMPLETED":
          result[BILL_WITEL].billComplete += 1;
          break;
        default:
          break;
      }
    });

    return Object.values(result);
  } catch (error) {
    console.error("❌ Error processing Excel file:", error);
    throw error;
  }
}

module.exports = processExcelData;
