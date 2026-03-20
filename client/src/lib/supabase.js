import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log("DEBUG: VITE_SUPABASE_URL exists?", !!supabaseUrl);
console.log("DEBUG: VITE_SUPABASE_ANON_KEY exists?", !!supabaseAnonKey);

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http")) {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    } catch (e) {
        console.error("Supabase init failed:", e);
    }
} else {
    console.warn('Supabase URL or Key is missing or invalid! Check .env file.')
}

export const supabase = supabaseInstance;
