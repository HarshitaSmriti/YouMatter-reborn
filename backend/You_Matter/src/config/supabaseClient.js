import { createClient } from "@supabase/supabase-js";
import './loadEnv.js';

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "placeholder-anon-key";

console.log("SUPABASE URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
