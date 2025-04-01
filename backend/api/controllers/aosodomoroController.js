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

// Get status based `bill_witel`
export const getReg3Status = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("aosodomoro_reg_3_status")
      .select("*");

    if (error) throw error;

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order_type based `bill_witel`
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

// Get sub_segmen based `bill_witel`
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

// Get  segmen based `bill_witel`
export const getReg3Segmen = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reg_3_segmen")
      .select("*");

    if (error) throw error;

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};