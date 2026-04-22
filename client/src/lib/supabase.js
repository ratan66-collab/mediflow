import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseInstance = null;

// Only create client if URL looks like a real Supabase URL (contains .supabase.co)
if (supabaseUrl && supabaseAnonKey && supabaseUrl.includes('.supabase.co') && supabaseUrl.startsWith("http")) {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    } catch (e) {
        console.error("Supabase init failed:", e);
    }
} else {
    console.warn('Supabase URL or Key is missing or invalid. Running in demo mode.')
}

export const supabase = supabaseInstance;
