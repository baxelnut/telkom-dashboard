import dotenv from "dotenv";
dotenv.config();

const { SPREADSHEET_ID, FORMATTED_GID, PO_GID } = process.env;

export const getGalaksiData = async (req, res) => {
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
      const rowData = headers.reduce((obj, key, index) => {
        obj[key] = values[index];
        return obj;
      }, {});
      return {
        ORDER_SUBTYPE2: rowData.ORDER_SUBTYPE2,
        PIC: rowData.PIC,
        KATEGORI_UMUR: rowData.KATEGORI_UMUR,
        KATEGORI: rowData.KATEGORI,
      };
    });

    // 🎯 Apply filter
    const filteredData = formattedData.filter(
      (row) => row.KATEGORI_UMUR === "> 3 BLN" && row.KATEGORI === "IN PROCESS"
    );

    const total = filteredData.length;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    res.json({
      data: paginatedData,
      totalProcessedData: total,
    });
  } catch (err) {
    console.error("🔥 Spreadsheet Fetch Error:", err);
    res.status(500).json({ error: err.message || "Unknown sheet error" });
  }
};

export const getGalaksiPO = async (req, res) => {
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
