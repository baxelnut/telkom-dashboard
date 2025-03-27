require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "🚨 Missing Supabase credentials! Check your Vercel env variables."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = async (req, res) => {
  try {
    const { data, error } = await supabase.from("aosodomoro").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("🔥 Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
