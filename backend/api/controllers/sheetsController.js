import dotenv from "dotenv";
dotenv.config();

import { sheetsClient, auth } from "../services/googleSheetsService.js";
import { getColumnLetter } from "../utils/columnUtils.js";
import { v4 as uuidv4 } from "uuid";
import { fetchFormattedReportData } from "./regional3Controller.js";

const { SPREADSHEET_ID, SPREADSHEET_GID, FORMATTED_SHEET_NAME, FORMATTED_GID } =
  process.env;

export const injectUUID = async (req, res) => {
  try {
    const { defaultNote = "" } = req.body;
    const sheetURL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${SPREADSHEET_GID}`;

    const raw = await fetch(sheetURL).then((res) => res.text());
    const json = JSON.parse(raw.substring(47).slice(0, -2));

    const headers = json.table.cols.map((col) => col.label || `col_${col.id}`);
    const finalHeaders = [...headers, "UUID", "STATUS", "NOTES", "LOG"];

    const formattedRows = json.table.rows.map((row) => {
      const values = row.c.map((cell) => cell?.v || "");
      return [...values, uuidv4(), "", defaultNote, ""];
    });

    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${FORMATTED_SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [finalHeaders, ...formattedRows] },
    });

    console.log("✅ Sheet updated with UUIDs and LOG.");
    res.json({
      message: "Sheet updated with UUID, STATUS, NOTES, and LOG.",
      totalRows: formattedRows.length,
    });
  } catch (err) {
    console.error("❌ injectUUID failed:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { STATUS, NOTES, LOG } = req.body;

    if (!STATUS && NOTES === undefined && LOG === undefined) {
      return res
        .status(400)
        .json({ message: "STATUS, NOTES or LOG required." });
    }

    const readRes = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: FORMATTED_SHEET_NAME,
    });

    const rows = readRes.data.values;
    if (!rows || rows.length === 0) throw new Error("Sheet is empty");

    const headers = rows[0];
    const uuidIndex = headers.indexOf("UUID");
    const statusIndex = headers.indexOf("STATUS");
    const notesIndex = headers.indexOf("NOTES");
    const logIndex = headers.indexOf("LOG");

    if (uuidIndex === -1) throw new Error("UUID column not found");
    if (statusIndex === -1) throw new Error("STATUS column not found");
    if (notesIndex === -1) throw new Error("NOTES column not found");
    if (logIndex === -1) throw new Error("LOG column not found");

    const rowIndex = rows.findIndex((row) => row[uuidIndex] === id);

    if (rowIndex === -1)
      return res.status(404).json({ message: "UUID not found" });

    const updates = [];

    console.log("UUID to find:", id);

    if (STATUS) {
      updates.push({
        range: `${FORMATTED_SHEET_NAME}!${getColumnLetter(statusIndex)}${
          rowIndex + 1
        }`,
        values: [[STATUS]],
      });
      console.log("Updating sheet:", FORMATTED_SHEET_NAME);
    }

    if (NOTES !== undefined) {
      updates.push({
        range: `${FORMATTED_SHEET_NAME}!${getColumnLetter(notesIndex)}${
          rowIndex + 1
        }`,
        values: [[NOTES]],
      });
      console.log("Updating sheet:", FORMATTED_SHEET_NAME);
    }

    if (LOG !== undefined) {
      updates.push({
        range: `${FORMATTED_SHEET_NAME}!${getColumnLetter(logIndex)}${
          rowIndex + 1
        }`,
        values: [[LOG]],
      });
      console.log("Updating sheet:", FORMATTED_SHEET_NAME);
    }

    await Promise.all(
      updates.map((update) =>
        sheetsClient.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: update.range,
          valueInputOption: "RAW",
          requestBody: { values: update.values },
        })
      )
    );

    res.json({ message: "✅ Sheet updated successfully." });
  } catch (err) {
    console.error("❌ updateSheet error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const processStatus = async (req, res) => {
  try {
    const data = await fetchFormattedReportData();

    const resultMap = {};

    data.forEach((entry) => {
      const witel = entry["BILL_WITEL"];

      if (!resultMap[witel]) {
        resultMap[witel] = {
          bill_witel: witel,
          lanjut: 0,
          cancel: 0,
          bukan_order_reg: 0,
          no_status: 0,
        };
      }

      switch (entry["STATUS"]) {
        case "Lanjut":
          resultMap[witel].lanjut++;
          break;
        case "Cancel":
          resultMap[witel].cancel++;
          break;
        case "Bukan Order Reg":
          resultMap[witel].bukan_order_reg++;
          break;
        default:
          resultMap[witel].no_status++;
          break;
      }
    });

    res.status(200).json({ data: Object.values(resultMap) });
  } catch (err) {
    console.error("processStatus error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const getAosodomoroSheet = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);

    const sheetURL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${FORMATTED_GID}`;
    const raw = await fetch(sheetURL).then((res) => res.text());
    const json = JSON.parse(raw.substring(47).slice(0, -2));

    const headers = json.table.cols.map((col) => col.label || `col_${col.id}`);

    const formattedData = json.table.rows.map((row) => {
      const values = row.c.map((cell) => cell?.v ?? "");
      return headers.reduce((obj, key, index) => {
        obj[key] = values[index];
        return obj;
      }, {});
    });

    const total = formattedData.length;
    const paginatedData = formattedData.slice(startIndex, endIndex);

    res.json({
      data: paginatedData,
      totalProcessedData: total,
    });
  } catch (err) {
    console.error("🔥 Spreadsheet Fetch Error:", err);
    res.status(500).json({ error: err.message || "Unknown sheet error" });
  }
};
