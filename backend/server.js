const express = require("express");
const cors = require("cors");
const path = require("path");
const processExcelData = require("./processExcelData");
const processPerformanceData = require("./performanceData");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const filePath = path.join(__dirname, "..", "public", "data", "dummy.xlsx");
console.log("Looking for file at:", filePath);

app.get("/api/processed_data", (req, res) => {
  try {
    const processedData = processExcelData(filePath);
    if (processedData.length <= 0) {
      console.log("⚠️ Processed data is empty. Check your Excel file.");
    }
    res.json(processedData);
  } catch (error) {
    console.error("❌ Error processing Excel file:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/performance", (req, res) => {
  try {
    const { columnName } = req.query;
    if (!columnName) {
      return res.status(400).json({ error: "Missing columnName parameter" });
    }
    const sessionData = processPerformanceData(filePath, columnName);
    if (sessionData.length <= 0) {
      console.log("⚠️ No valid data found for the given column.");
    }
    res.json(sessionData);
  } catch (error) {
    console.error("❌ Error processing performance data:", error);
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
