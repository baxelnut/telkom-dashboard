const express = require("express");
const cors = require("cors");
const path = require("path");
const processExcelData = require("./processWitelData");
const processPerformanceData = require("./perfomanceData");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const filePath = path.join(__dirname, "..", "public", "data", "dummy.xlsx");
console.log("Looking for file at:", filePath);

app.get("/api/processed_data", (req, res) => {
  try {
    console.log("📂 Reading and processing data from:", filePath);

    const processedData = processExcelData(filePath);

    if (processedData.length > 0) {
      console.log("✅ Successfully processed data!");
    } else {
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

    console.log(`📊 Processing performance data for column: ${columnName}`);

    const processedData = processPerformanceData(filePath, columnName);

    if (processedData.length > 0) {
      console.log("✅ Successfully processed performance data!");
    } else {
      console.log("⚠️ No valid data found for the given column.");
    }

    res.json(processedData);
  } catch (error) {
    console.error("❌ Error processing performance data:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
