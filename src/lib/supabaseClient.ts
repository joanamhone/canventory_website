import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Initialize Supabase client (replace with your own URL and anon key)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);