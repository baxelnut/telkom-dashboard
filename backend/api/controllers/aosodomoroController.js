import supabase from "../services/supabaseService.js";

export const getAllAosodomoro = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const start = (page - 1) * limit;
    const end = start + parseInt(limit) - 1;

    // console.log("📦 Fetching AOSODOMORO data from", start, "to", end);

    const { data, error } = await supabase
      .from("aosodomoro")
      .select("*")
      .order("id", { ascending: true })
      .range(start, end);

    if (error) throw new Error("❌ Data fetch failed: " + error.message);

    let total = null;
    try {
      const { count, error: countError } = await supabase
        .from("aosodomoro")
        .select("id", { count: "exact", head: true });

      if (countError) throw countError;
      total = count;
    } catch (err) {
      console.warn("⚠️ Count failed, using fallback total");
      total = null;
    }

    res.json({ data, total });
  } catch (err) {
    console.error("🔥 Backend Crash in getAllAosodomoro:", err);
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
};

// Get `order_type` based `bill_witel`
export const getReg3OrderSubtype = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("aosodomoro_reg_3_subtypes")
      .select("*");

    if (error) throw error;

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get `sub_segmen` based `bill_witel`
export const getReg3SubSegmen = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("aosodomoro_reg_3_subsegmen")
      .select("*");

    if (error) throw error;

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get `segmen` based `bill_witel` for radar chart
export const getReg3Segmen = async (req, res) => {
  try {
    const { data, error } = await supabase.from("reg_3_segmen").select("*");

    if (error) throw error;

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get `segmen` based `bill_witel` for bar chart
export const getAosodomoroSegmen = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("aosodomoro_reg_3_segmen")
      .select("*");

    if (error) throw error;

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get `kategori` based `bill_witel`
export const getReg3Kategori = async (req, res) => {
  try {
    const { data, error } = await supabase.from("reg_3_kategori").select("*");

    if (error) throw error;

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get numeric per date based `bill_witel`
export const getReg3Progress = async (req, res) => {
  try {
    const { data, error } = await supabase.from("reg_3_progress").select("*");

    if (error) throw error;

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
