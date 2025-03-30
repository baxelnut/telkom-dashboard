import supabase from "../services/supabaseService.js";

export const getAllAosodomoro = async (req, res) => {
  try {
    let { data, error } = await supabase
      .from("aosodomoro")
      .select("*")
      .limit(11);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
