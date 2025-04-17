import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SPREADSHEET_GID = process.env.SPREADSHEET_GID;
const FORMATTED_SHEET_NAME = process.env.FORMATTED_SHEET_NAME;

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_KEY_FILE,
  scopes: [process.env.GOOGLE_SCOPES],
});

const namingConvention = {
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

export const injectUUID = async (req, res) => {
  try {
    const { defaultNote = "" } = req.body;

    const sheetURL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${SPREADSHEET_GID}`;
    const response = await fetch(sheetURL);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));

    const cols = json.table.cols.map((col) => col.label || `col_${col.id}`);
    const finalHeaders = [...cols, "UUID", "STATUS", "NOTES"];

    const formattedRows = json.table.rows.map((row) => {
      const values = row.c.map((cell) => cell?.v || "");
      values.push(uuidv4());
      values.push("");
      values.push(defaultNote);
      return values;
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${FORMATTED_SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [finalHeaders, ...formattedRows],
      },
    });

    console.log("✅ Sheet updated successfully with UUID, STATUS, NOTES.");
    res.json({
      message: "Formatted sheet updated with UUID, STATUS, and NOTES.",
      totalRows: formattedRows.length,
    });
  } catch (err) {
    console.error("❌ Failed to process sheet:", err);
    res.status(500).json({ error: err.message });
  }
};

function getColumnLetter(index) {
  let letter = "";
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

export const updateSheet = async (req, res) => {
  try {
    const id = req.params.id;
    const { STATUS, NOTES } = req.body;

    if (!STATUS && !NOTES) {
      return res
        .status(400)
        .json({ message: "Missing STATUS or NOTES in request body" });
    }

    const sheets = google.sheets({ version: "v4", auth });

    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: FORMATTED_SHEET_NAME,
    });

    const rows = readRes.data.values;
    if (!rows || rows.length === 0) {
      throw new Error("No data found in the sheet");
    }

    const headers = rows[0];
    const uuidIndex = headers.indexOf("UUID");
    const statusIndex = headers.indexOf("STATUS");
    const notesIndex = headers.indexOf("NOTES");

    const rowIndex = rows.findIndex((row) => row[uuidIndex] === id);

    if (rowIndex === -1) {
      return res
        .status(404)
        .json({ message: "Row with specified UUID not found" });
    }

    const updates = [];

    if (STATUS) {
      updates.push({
        range: `${FORMATTED_SHEET_NAME}!${getColumnLetter(statusIndex)}${
          rowIndex + 1
        }`,
        values: [[STATUS]],
      });
    }

    if (NOTES !== undefined) {
      updates.push({
        range: `${FORMATTED_SHEET_NAME}!${getColumnLetter(notesIndex)}${
          rowIndex + 1
        }`,
        values: [[NOTES]],
      });
    }

    await Promise.all(
      updates.map((update) =>
        sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: update.range,
          valueInputOption: "RAW",
          requestBody: {
            values: update.values,
          },
        })
      )
    );

    res.status(200).json({ message: "Sheet updated successfully" });
  } catch (err) {
    console.error("Error updating Google Sheets:", err);
    res.status(500).json({ error: err.message });
  }
};
