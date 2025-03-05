const express = require("express");
const cors = require("cors");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const filePath = path.join(__dirname, "..", "public", "data", "dummy.xlsx");
console.log("Looking for file at:", filePath);

if (!fs.existsSync(filePath)) {
  console.error("❌ Excel file not found at:", filePath);
} else {
  console.log("📂 File found, ready to read.");
}

app.get("/api/data", (req, res) => {
  try {
    console.log("Attempting to read file from:", filePath);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (jsonData.length > 0) {
      console.log("✅ Successfully read data!");
    } else {
      console.log("⚠️ Excel file is empty or incorrectly formatted.");
    }

    res.json(jsonData);
  } catch (error) {
    console.error("❌ Error reading Excel file:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
