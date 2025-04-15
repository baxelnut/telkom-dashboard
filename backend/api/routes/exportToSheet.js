import express from "express";
import { google } from "googleapis";

const router = express.Router();

const auth = new google.auth.GoogleAuth({
  keyFile: "./keys/export-sheet-test-f66d9a06e655.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = "1kz3hx8f_kRnpsRIULAaXWMQQ8wVLMlvDpYhHwhYr3Ww";

router.post("/", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const { data, sheetName = "Example" } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const values = data.map((obj) => Object.values(obj));

    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}`,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    res.status(200).json({ message: `Exported to ${sheetName} ✅` });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to export to sheet" });
  }
});

export default router;
