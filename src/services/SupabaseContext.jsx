import { createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("❌ Supabase URL or Key is missing! Check your .env file.");
}

// Create Context
const SupabaseContext = createContext(null);

// Initialize Supabase once
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Custom Hook to use Supabase
export const useSupabase = () => {
  return useContext(SupabaseContext);
};

// Provider Component
export function SupabaseProvider({ children }) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}
