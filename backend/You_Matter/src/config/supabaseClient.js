import { createClient } from "@supabase/supabase-js";
import './loadEnv.js';

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "placeholder-anon-key";

console.log("SUPABASE URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
