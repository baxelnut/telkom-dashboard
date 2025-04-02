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

export const getReg3ReportData = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc("get_reg3_report");

    if (error) throw error;

    console.log("Raw SQL Function Output:", data);

    const big5Witel = [
      "MALANG",
      "SIDOARJO",
      "NUSA TENGGARA",
      "BALI",
      "SURAMADU",
    ];

    const processedData = big5Witel.map((witel) => {
      const witelData = data.filter((row) => row.bill_witel === witel);

      return {
        witelName: witel,
        "<3bln": witelData
          .filter((row) => row.kategori_umur === "< 3 BLN")
          .reduce((acc, row) => acc + row.totalcount, 0),
        ">3bln": witelData
          .filter((row) => row.kategori_umur === "> 3 BLN")
          .reduce((acc, row) => acc + row.totalcount, 0),
        "total<3blnRevenue": witelData
          .filter((row) => row.kategori_umur === "< 3 BLN")
          .reduce((acc, row) => acc + row.totalrevenue, 0),
        "total>3blnRevenue": witelData
          .filter((row) => row.kategori_umur === "> 3 BLN")
          .reduce((acc, row) => acc + row.totalrevenue, 0),
      };
    });

    res.json({ data: processedData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
