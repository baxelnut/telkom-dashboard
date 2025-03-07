const express = require("express");
const cors = require("cors");
const path = require("path");
const processExcelData = require("./processExcelData");
const processPerformanceData = require("./performanceData");
const { processReportData } = require("./report");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Define the file path for the Excel file
const filePath = path.join(__dirname, "..", "public", "data", "dummy.xlsx");
console.log("📂 Looking for file at:", filePath);

// 🟢 API: Get processed witel data only
app.get("/api/processed_data", (req, res) => {
  try {
    const { processedData } = processExcelData(filePath);
    if (processedData.length === 0) {
      console.warn("⚠️ Processed data is empty. Check your Excel file.");
    }
    res.json(processedData);
  } catch (error) {
    console.error("❌ Error processing Excel file:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🟢 API: Get raw data only
app.get("/api/all-data", (req, res) => {
  try {
    const { rawData } = processExcelData(filePath);
    if (rawData.length === 0) {
      console.warn("⚠️ Raw data is empty. Check your Excel file.");
    }
    res.json(rawData);
  } catch (error) {
    console.error("❌ Error fetching raw data:", error);
    res.status(500).json({ error: "Failed to fetch raw data" });
  }
});

// 🟢 API: Get performance data by column
app.get("/api/performance", (req, res) => {
  try {
    const { columnName } = req.query;
    if (!columnName) {
      return res.status(400).json({ error: "Missing columnName parameter" });
    }

    const sessionData = processPerformanceData(filePath, columnName);
    if (sessionData.length === 0) {
      console.warn("⚠️ No valid data found for the given column.");
    }
    res.json(sessionData);
  } catch (error) {
    console.error("❌ Error processing performance data:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🟢 API: Get processed report data
app.get("/api/report", (req, res) => {
  try {
    console.log("📊 Processing report data...");

    const reportData = processReportData(filePath); // ✅ This now works!

    if (Object.keys(reportData).length === 0) {
      console.warn("⚠️ Report data is empty. Check your Excel file.");
    }

    res.json(reportData);
  } catch (error) {
    console.error("❌ Error processing report data:", error);
    res.status(500).json({ error: "Failed to process report data" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
