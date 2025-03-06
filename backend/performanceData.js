const XLSX = require("xlsx");
const path = require("path");

function processPerformanceData(filePath, columnName) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!jsonData.length) {
      throw new Error("❌ Excel file is empty or incorrectly formatted.");
    }

    const customerCounts = jsonData.reduce((acc, row) => {
      const customer = row[columnName] || "Unknown";
      acc[customer] = (acc[customer] || 0) + 1;
      return acc;
    }, {});

    const sortedData = Object.entries(customerCounts)
      .map(([name, sessions]) => ({ name, sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);

    const totalSessions = Object.values(customerCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    // console.log("🔍 First row:", jsonData[0]);
    // console.log("🔍 Available columns:", Object.keys(jsonData[0]));

    return sortedData.map((customer) => ({
      name: customer.name,
      sessions: customer.sessions,
      percentage: (customer.sessions / totalSessions) * 100,
    }));
  } catch (error) {
    console.error("❌ Error processing performance data:", error);
    throw error;
  }
}

module.exports = processPerformanceData;
