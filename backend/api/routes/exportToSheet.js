import express from "express";
import { google } from "googleapis";

const router = express.Router();

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_KEY_FILE,
  scopes: [process.env.GOOGLE_SCOPES],
});

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

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
