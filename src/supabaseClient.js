import { createClient } from '@supabase/supabase-js'

// This tells the app to look for the keys in your Vercel settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)