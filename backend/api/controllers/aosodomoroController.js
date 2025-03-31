import supabase from "../services/supabaseService.js";

export const getAllAosodomoro = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const start = (page - 1) * limit;
    const end = start + parseInt(limit) - 1;

    // Fetch paginated data
    const { data, error } = await supabase
      .from("aosodomoro")
      .select("*")
      .range(start, end);

    if (error) throw error;

    // Fetch total row count
    const { count, error: countError } = await supabase
      .from("aosodomoro")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    res.json({ data, total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Only Filtered `bill_witel`
export const getReg3Aosodomoro = async (req, res) => {
  try {
    const { data, error } = await supabase.from("aosodomoro_reg_3").select("*");

    if (error) throw error;

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
