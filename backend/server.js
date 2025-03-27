require("dotenv").config({ path: "../.env" });

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const PORT = process.env.PORT;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("🚨 Missing Supabase credentials! Check your .env file.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.get("/api/data", async (req, res) => {
  try {
    const { data, error } = await supabase.from("aosodomoro").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("🔥 Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
);
