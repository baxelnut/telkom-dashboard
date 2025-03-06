const XLSX = require("xlsx");

function processExcelData(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const validWitels = [
      "BALI",
      "MALANG", // "JATIM TIMUR",
      "NUSA TENGGARA",
      "SIDOARJO", // "JATIM BARAT",
      "SURAMADU",
    ];

    jsonData = jsonData.filter((row) => validWitels.includes(row.BILL_WITEL));
    // console.log(jsonData);

    // 🔥 Optional: Remove unwanted columns
    // jsonData = jsonData.map(({ UnwantedColumn, ...rest }) => rest);

    return jsonData;
  } catch (error) {
    console.error("❌ Error processing Excel file:", error);
    throw error;
  }
}

module.exports = processExcelData;
