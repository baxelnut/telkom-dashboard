import supabase from "../services/supabaseService.js";

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

  const groupedByWitel = groupBy(data, "bill_witel");

  return Object.keys(groupedByWitel)
    .map((witelName) => {
      if (!big5Witel.includes(witelName)) {
        return null;
      }

      const witelData = groupedByWitel[witelName];

      const kategoriData = witelData.reduce((result, item) => {
        const kategori = item.kategori;
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
    const currentKategori = item.kategori;
    const kategoriUmur = item.kategori_umur;
    const revenue = item.revenue;
    const orderSubtype = item.order_subtype;

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

export const getReg3ReportData = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("regional_3")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    console.log("Total raw data: ", data.length);
    console.log("Total processed data: ", processData(data).length);

    const processedData = processData(data);

    res.json({
      data: processedData,
      totalRawData: data.length,
      totalProcessedData: processedData.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReg3InProcessData = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("regional_3_in_process")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    console.log("Total raw data: ", data.length);
    console.log("Total processed data: ", processData(data).length);

    const processedData = processData(data);

    res.json({
      data: processedData,
      totalRawData: data.length,
      totalProcessedData: processedData.length,
    });
  } catch (err) {
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
