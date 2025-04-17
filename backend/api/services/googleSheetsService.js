import "dotenv/config"; 
import { google } from "googleapis";

if (
  !process.env.GOOGLE_KEY_FILE ||
  !process.env.SPREADSHEET_ID ||
  !process.env.FORMATTED_SHEET_NAME
) {
  throw new Error("❌ Missing Google Sheets env vars!");
}

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_KEY_FILE,
  scopes: [process.env.GOOGLE_SCOPES],
});

const sheetsClient = google.sheets({ version: "v4", auth });

export { sheetsClient, auth };
