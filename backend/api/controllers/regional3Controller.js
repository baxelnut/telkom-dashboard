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

const categoryMapping = {
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

export const getReg3ReportData = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("regional_3")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    console.log("Raw SQL Function Output:", JSON.stringify(data, null, 2));

    const processedData = processData(data);

    res.json({ data: processedData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const processData = (data) => {
  const groupedByWitel = groupBy(data, "bill_witel");

  return Object.keys(groupedByWitel).map((witelName) => {
    const witelData = groupedByWitel[witelName];

    const billingCompletedData = processBillingData(witelData);

    return {
      witelName,
      "BILLING COMPLETED": billingCompletedData,
    };
  });
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

const processBillingData = (witelData) => {
  const kategoriCounts = { "<3bln": 0, ">3bln": 0 };
  const revenueCounts = { "<3bln": 0, ">3bln": 0 };
  const items = { "<3bln": [], ">3bln": [] };

  witelData.forEach((item) => {
    const kategori = item.kategori_umur;
    const revenue = item.revenue;

    if (kategori === "< 3 BLN") {
      kategoriCounts["<3bln"] += 1;
      revenueCounts["<3bln"] += revenue;
      items["<3bln"].push({
        ["id"]: item.id,
        ["order_subtype"]: item.order_subtype,
        ["revenue"]: item.revenue,
      });
    } else if (kategori === "> 3 BLN") {
      kategoriCounts[">3bln"] += 1;
      revenueCounts[">3bln"] += revenue;
      items[">3bln"].push({
        ["id"]: item.id,
        ["order_subtype"]: item.order_subtype,
        ["revenue"]: item.revenue,
      });
    }
  });

  return {
    ["kategori_umur_<3bln"]: kategoriCounts["<3bln"],
    ["kategori_umur_>3bln"]: kategoriCounts[">3bln"],
    ["revenue_<3bln"]: revenueCounts["<3bln"],
    ["revenue_>3bln"]: revenueCounts[">3bln"],
    ["<3blnItems"]: items["<3bln"],
    [">3blnItems"]: items[">3bln"],
  };
};
