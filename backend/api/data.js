import "dotenv/config";
import allowCors from "./cors";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

console.log("🔥 Supabase URL:", SUPABASE_URL);
console.log("🔥 Supabase Key:", SUPABASE_KEY ? "✅ Loaded" : "❌ MISSING");

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("🚨 Missing Supabase credentials! Check your .env file.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.from("aosodomoro").select("*");
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error("🔥 API ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export const config = {
  runtime: "nodejs",
};
