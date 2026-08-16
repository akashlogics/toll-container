import { createClient } from "@supabase/supabase-js";

// These come from Project Settings -> API in your Supabase dashboard.
// Both are safe to expose in the browser by design -- the anon key only
// ever grants what the Row Level Security policies in schema.sql allow.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Loud, obvious failure instead of a silent blank screen -- this is the
  // single most common setup mistake (forgetting the .env file).
  console.error(
    "Missing Supabase env vars. Create a .env file (see .env.example) with " +
    "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project's " +
    "Settings -> API page, then restart the dev server."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
