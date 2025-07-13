import "dotenv/config";
import { google } from "googleapis";

if (
  !process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
  !process.env.SPREADSHEET_ID ||
  !process.env.FORMATTED_SHEET_NAME
) {
  throw new Error("Missing Google Sheets env vars!");
}

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: [
    process.env.GOOGLE_SCOPES || "https://www.googleapis.com/auth/spreadsheets",
  ],
});

const sheetsClient = google.sheets({ version: "v4", auth });

export { sheetsClient, auth };
