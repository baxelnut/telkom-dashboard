import supabase from "../services/supabaseService.js";

export const getAllRegional3Data = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const start = (page - 1) * limit;
    const end = start + parseInt(limit) - 1;

    const { data, error } = await supabase
      .from("regional_3")
      .select("*")
      .order("id", { ascending: true })
      .range(start, end);

    if (error) throw error;

    const { count, error: countError } = await supabase
      .from("regional_3")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    res.json({ data, total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
          id: item.id,
          order_subtype: newOrderSubtype,
          revenue: item.revenue,
        });
      } else if (kategoriUmur === "> 3 BLN") {
        kategoriCounts[">3bln"] += 1;
        revenueCounts[">3bln"] += revenue;
        items[">3bln"].push({
          id: item.id,
          order_subtype: newOrderSubtype,
          revenue: item.revenue,
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
      totalProcessedData: processData(data).length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
