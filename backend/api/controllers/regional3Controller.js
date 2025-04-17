import supabase from "../services/supabaseService.js"; 

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SPREADSHEET_GID = process.env.SPREADSHEET_GID;
const FORMATTED_GID = process.env.FORMATTED_GID;

export const getAllRegional3Data = async (req, res) => {
  try {
    let { page = 1, limit = 100 } = req.query;

    page = Math.max(1, parseInt(page));
    limit = Math.max(1, Math.min(1000, parseInt(limit)));

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const [dataResponse, countResponse] = await Promise.all([
      supabase
        .from("regional_3")
        .select("*")
        .order("id", { ascending: true })
        .range(start, end),

      supabase.from("regional_3").select("*", { count: "exact", head: true }),
    ]);

    if (dataResponse.error) {
      console.error("Error fetching data:", dataResponse.error);
      throw new Error("Failed to fetch regional data.");
    }

    if (countResponse.error) {
      console.error("Error fetching count:", countResponse.error);
      throw new Error("Failed to fetch total count.");
    }

    res.json({ data: dataResponse.data, total: countResponse.count || 0 });
  } catch (err) {
    console.error("API Error:", err);
    res
      .status(500)
      .json({ error: err.message || "An unexpected error occurred." });
  }
};

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

const processData = (data) => {
  const big5Witel = ["MALANG", "SIDOARJO", "NUSA TENGGARA", "BALI", "SURAMADU"];

  const groupedByWitel = groupBy(data, "BILL_WITEL");

  return Object.keys(groupedByWitel)
    .map((witelName) => {
      if (!big5Witel.includes(witelName)) {
        return null;
      }

      const witelData = groupedByWitel[witelName];

      const kategoriData = witelData.reduce((result, item) => {
        const kategori = item["KATEGORI"];
        if (!result[kategori]) {
          result[kategori] = processKategoriData(witelData, kategori);
        }
        return result;
      }, {});

      return {
        witelName,
        ...kategoriData,
      };
    })
    .filter(Boolean);
};

const groupBy = (data, field) => {
  return data.reduce((result, item) => {
    const key = item[field];
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
};

const processKategoriData = (witelData, kategori) => {
  const kategoriCounts = { "<3bln": 0, ">3bln": 0 };
  const revenueCounts = { "<3bln": 0, ">3bln": 0 };
  const items = { "<3bln": [], ">3bln": [] };

  witelData.forEach((item) => {
    const currentKategori = item["KATEGORI"];
    const kategoriUmur = item["KATEGORI_UMUR"];

    let rawRevenue = item["REVENUE"];
    // console.log("Revenue Field:", item["REVENUE"]);

    // Set revenue to 0 if it's null, NaN, or empty
    let revenue = rawRevenue;
    if (
      rawRevenue === null ||
      rawRevenue === "" ||
      isNaN(parseFloat(rawRevenue))
    ) {
      // console.log("Invalid revenue detected. Setting to 0.");
      revenue = 0;
    } else {
      revenue = parseFloat(rawRevenue);
    }

    // Debugging logs
    // console.log("Raw Revenue:", rawRevenue);
    // console.log("Parsed Revenue:", revenue);

    const orderSubtype = item["ORDER_SUBTYPE"];

    if (currentKategori === kategori) {
      const newOrderSubtype =
        Object.keys(namingConvention).find((key) =>
          namingConvention[key].includes(orderSubtype)
        ) || orderSubtype;

      if (kategoriUmur === "< 3 BLN") {
        kategoriCounts["<3bln"] += 1;
        revenueCounts["<3bln"] += revenue;
        items["<3bln"].push({
          normalized_order_subtype: newOrderSubtype,
          ...item,
        });
      } else if (kategoriUmur === "> 3 BLN") {
        kategoriCounts[">3bln"] += 1;
        revenueCounts[">3bln"] += revenue;
        items[">3bln"].push({
          normalized_order_subtype: newOrderSubtype,
          ...item,
        });
      }
    }
  });

  return {
    [`kategori_umur_<3bln`]: kategoriCounts["<3bln"],
    [`kategori_umur_>3bln`]: kategoriCounts[">3bln"],
    [`revenue_<3bln`]: revenueCounts["<3bln"],
    [`revenue_>3bln`]: revenueCounts[">3bln"],
    [`<3blnItems`]: items["<3bln"],
    [`>3blnItems`]: items[">3bln"],
  };
};

// Get `status` based `bill_witel`
export const getReg3Status = async (req, res) => {
  try {
    const BIG5 = ["BALI", "MALANG", "NUSA TENGGARA", "SIDOARJO", "SURAMADU"];

    const { data, error } = await supabase
      .from("regional_3_in_process")
      .select("id, bill_witel, in_process_status")
      .order("id", { ascending: true });

    if (error) throw error;

    const grouped = {};

    data.forEach((row) => {
      const witel = row.bill_witel?.trim().toUpperCase();
      if (!BIG5.includes(witel)) return;

      const rawStatus = row.in_process_status?.trim() || "No Status";

      let key;
      if (rawStatus === "Lanjut") key = "lanjut";
      else if (rawStatus === "Cancel") key = "cancel";
      else if (rawStatus === "Bukan Order Reg") key = "bukan_order_reg";
      else key = "no_status";

      if (!grouped[witel]) {
        grouped[witel] = {
          bill_witel: witel,
          lanjut: 0,
          cancel: 0,
          bukan_order_reg: 0,
          no_status: 0,
        };
      }

      grouped[witel][key]++;
    });

    const result = Object.values(grouped);
    res.json({ data: result });
  } catch (err) {
    console.error("🔥 Backend error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// export const getReg3ReportData = async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from("regional_3")
//       .select("*")
//       .order("id", { ascending: true });

//     if (error) throw error;

//     console.log("Total raw data: ", data.length);
//     console.log("Total processed data: ", processData(data).length);

//     const processedData = processData(data);

//     res.json({
//       data: processedData,
//       totalRawData: data.length,
//       totalProcessedData: processedData.length,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const getReg3ReportData = async (req, res) => {
  try {
    const sheetURL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${FORMATTED_GID}`;

    const response = await fetch(sheetURL);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));

    const cols = json.table.cols.map((col) => col.label || `col_${col.id}`);

    const rows = json.table.rows.map((row) => {
      const obj = {};
      row.c.forEach((cell, index) => {
        obj[cols[index]] = cell?.v || null;
      });

      return obj;
    });

    const processedData = processData(rows);

    // console.log("Total raw data: ", rows.length);
    // console.log("Total processed data: ", processedData.length);

    res.json({
      data: processedData,
      totalRawData: rows.length,
      totalProcessedData: processedData.length,
    });
  } catch (err) {
    console.error("Failed to fetch sheet:", err);
    res.status(500).json({ error: err.message });
  }
};

// export const getReg3InProcessData = async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from("regional_3_in_process")
//       .select("*")
//       .order("id", { ascending: true });

//     if (error) throw error;

//     console.log("Total raw data: ", data.length);
//     console.log("Total processed data: ", processData(data).length);

//     const processedData = processData(data);

//     res.json({
//       data: processedData,
//       totalRawData: data.length,
//       totalProcessedData: processedData.length,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const getReg3InProcessData = async (req, res) => {
  try {
    const sheetURL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${SPREADSHEET_GID}`;

    const response = await fetch(sheetURL);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
 
    const cols = json.table.cols.map((col) => col.label || `col_${col.id}`);
 
    const rows = json.table.rows.map((row) => {
      const obj = {};
      row.c.forEach((cell, index) => {
        obj[cols[index]] = cell?.v || null;
      });
      return obj;
    });
 
    const normalize = (str) => str?.replace(/\s+/g, " ").trim().toUpperCase();
 
    const inProcessRows = rows.filter(
      (row) => normalize(row["KATEGORI"]) === "IN PROCESS"
    );

  
    const processedData = processData(inProcessRows);

    res.json({
      data: processedData,
      totalRawData: rows.length,
      totalProcessedData: processedData.length,
    });
  } catch (err) {
    console.error("🔥 Failed to fetch sheet:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const updateReg3Data = async (req, res) => {
  const { id } = req.params;
  const { in_process_status } = req.body;

  const { data, error } = await supabase
    .from("regional_3")
    .update({ in_process_status })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Update failed:", error);
    return res.status(500).json({ error: "Update failed" });
  }

  return res.status(200).json({ data });
};

export const getReg3ProgressOst = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("mv_reg_3_order_subtype")
      .select("*")
      .limit(100);

    if (error) throw error;

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
