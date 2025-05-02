import dotenv from "dotenv";
dotenv.config();

import { sheetsClient, auth } from "../services/googleSheetsService.js";
import { getColumnLetter } from "../utils/columnUtils.js";
import { v4 as uuidv4 } from "uuid";
import { fetchFormattedReportData } from "./regional3Controller.js";

const {
  SPREADSHEET_ID,
  SPREADSHEET_GID,
  FORMATTED_SHEET_NAME,
  FORMATTED_GID,
  PO_GID,
} = process.env;

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

    const filteredData = data.filter(
      (entry) => entry["KATEGORI"] === "IN PROCESS"
    );

    const resultMap = {};

    filteredData.forEach((entry) => {
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

export const getSheet = async (req, res) => {
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

export const getOrderSubtypeRev = async (req, res) => {
  const sheetURL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${FORMATTED_GID}`;

  try {
    const response = await fetch(sheetURL);
    const text = await response.text();

    const jsonText = text.substring(47).slice(0, -2);
    const sheetData = JSON.parse(jsonText);

    const cols = sheetData.table.cols.map((col) => col.label);
    const rows = sheetData.table.rows;

    const resultMap = {};

    rows.forEach((row) => {
      const rowData = {};
      row.c.forEach((cell, index) => {
        rowData[cols[index]] = cell?.v ?? null;
      });

      const witel = rowData["BILL_WITEL"];

      if (!witel || witel.trim() === "") return;

      const subtypeRaw = rowData["ORDER_SUBTYPE"];
      const subtype = subtypeRaw?.toLowerCase().replace(/\s+/g, "_");
      const revenue = parseFloat(rowData["REVENUE"]) || 0;

      if (!resultMap[witel]) {
        resultMap[witel] = {
          bill_witel: witel,
          new_install: 0,
          modify: 0,
          suspend: 0,
          disconnect: 0,
          upgrade: 0,
          downgrade: 0,
          other: 0,
        };
      }

      if (resultMap[witel][subtype] !== undefined) {
        resultMap[witel][subtype] += revenue;
      } else {
        resultMap[witel]["other"] += revenue;
      }
    });

    res.status(200).json({ data: Object.values(resultMap) });
  } catch (error) {
    console.error("getOrderSubtypeRev error:", error);
    res.status(500).json({ error: "Failed to fetch order subtype data." });
  }
};

export const getSheetSegmen = async (req, res) => {
  try {
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

    const grouped = {};
    for (const row of formattedData) {
      const billWitel = row["bill_witel"] || row["BILL_WITEL"];
      const subSegmen = row["segmen"] || row["SEGMEN"];
      if (!billWitel || !subSegmen) continue;

      const key = `${billWitel}||${subSegmen}`;
      if (!grouped[key]) {
        grouped[key] = {
          bill_witel: billWitel,
          segmen: subSegmen,
          quantity: 0,
        };
      }
      grouped[key].quantity += 1;
    }

    const result = Object.values(grouped);
    res.json({ data: result });
  } catch (err) {
    console.error("🔥 Spreadsheet Fetch Error:", err);
    res.status(500).json({ error: err.message || "Unknown sheet error" });
  }
};

export const getSheetOrderType2 = async (req, res) => {
  try {
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

    const actionMap = {};

    for (const row of formattedData) {
      const witel = row["bill_witel"] || row["BILL_WITEL"];
      const subtype2Raw = row["order_subtype2"] || row["ORDER_SUBTYPE2"];
      const subtype2 = subtype2Raw?.toLowerCase().trim();

      if (!witel || !subtype2) continue;

      if (!actionMap[witel]) {
        actionMap[witel] = {
          bill_witel: witel,
          ao: 0,
          so: 0,
          do: 0,
          mo: 0,
          ro: 0,
        };
      }

      const target = actionMap[witel];

      if (subtype2.includes("ao")) target.ao += 1;
      else if (subtype2.includes("so")) target.so += 1;
      else if (subtype2.includes("do")) target.do += 1;
      else if (subtype2.includes("mo")) target.mo += 1;
      else if (subtype2.includes("ro")) target.ro += 1;
    }

    res.json({ data: Object.values(actionMap) });
  } catch (err) {
    console.error("🔥 Sheet Parse Error:", err);
    res.status(500).json({ error: err.message || "Unknown sheet error" });
  }
};


export const getSheetOrderSimplified = async (req, res) => {
  try {
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

    const actionMap = formattedData.reduce((acc, row) => {
      const witel = row["bill_witel"] || row["BILL_WITEL"];
      const segmenRaw = row["segmen"] || row["SEGMEN"];
      const segmen = segmenRaw ? segmenRaw.trim().toLowerCase() : "";

      if (!witel || !segmen) return acc;

      if (!acc[witel]) {
        acc[witel] = {
          bill_witel: witel,
          state_owned_enterprise_service: 0,
          government: 0,
          regional: 0,
          private_service: 0,
          enterprise: 0,
        };
      }

      const target = acc[witel];

      switch (segmen) {
        case "government":
          target.government += 1;
          break;
        case "state-owned enterprise service":
          target.state_owned_enterprise_service += 1;
          break;
        case "private service":
          target.private_service += 1;
          break;
        case "regional":
          target.regional += 1;
          break;
        case "enterprise":
          target.enterprise += 1;
          break;
        default:
          console.log(`Unknown segmen type: ${segmen}`);
      }

      return acc;
    }, {});

    res.json({ data: Object.values(actionMap) });
  } catch (err) {
    console.error("🔥 Sheet Parse Error:", err);
    res.status(500).json({ error: err.message || "Unknown sheet error" });
  }
};

export const getSheetKategoriSimplified = async (req, res) => {
  try {
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

    const actionMap = formattedData.reduce((acc, row) => {
      const witel = row["bill_witel"] || row["BILL_WITEL"];
      const kategoriRaw = row["kategori"] || row["KATEGORI"];
      const kategori = kategoriRaw ? kategoriRaw.trim().toLowerCase() : "";

      if (!witel || !kategori) return acc;

      if (!acc[witel]) {
        acc[witel] = {
          bill_witel: witel,
          billing_completed: 0,
          in_process: 0,
          prov_complete: 0,
          provide_order: 0,
          ready_to_bill: 0,
        };
      }

      const target = acc[witel];

      switch (kategori) {
        case "billing completed":
          target.billing_completed += 1;
          break;
        case "in process":
          target.in_process += 1;
          break;
        case "prov. complete":
          target.prov_complete += 1;
          break;
        case "provide order":
          target.provide_order += 1;
          break;
        case "ready to bill":
          target.ready_to_bill += 1;
          break;
        default:
          console.log(`Unknown kategori type: ${kategori}`);
      }

      return acc;
    }, {});

    res.json({ data: Object.values(actionMap) });
  } catch (err) {
    console.error("🔥 Sheet Parse Error:", err);
    res.status(500).json({ error: err.message || "Unknown sheet error" });
  }
};

export const getPO = async (req, res) => {
  try {
    const sheetURL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${PO_GID}`;
    const raw = await fetch(sheetURL).then((res) => res.text());

    const json = JSON.parse(raw.substring(47).slice(0, -2));

    const rawHeaders = json.table.rows[0].c;
    const headerRow = rawHeaders
      .map((cell) => cell?.v?.toString().trim())
      .map((header, idx) => ({ header, idx }))
      .filter(({ header }) => header);

    const dataRows = json.table.rows.slice(1);

    const data = dataRows
      .map((row) => {
        if (!row?.c) return null;
        const obj = {};
        headerRow.forEach(({ header, idx }) => {
          const cell = row.c[idx];
          obj[header] = cell?.v || "";
        });

        return Object.values(obj).every((v) => v === "") ? null : obj;
      })
      .filter(Boolean);

    res.status(200).json({ data });
  } catch (err) {
    console.error("❌ getPO failed:", err);
    res.status(500).json({ error: err.message });
  }
};
