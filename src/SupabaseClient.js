import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.https://ctjwqktzdvbfijoqnxvo.supabase.co
const supabaseKey = import.meta.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0andxa3R6ZHZiZmlqb3FueHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0ODY3MDksImV4cCI6MjA4NzA2MjcwOX0.ng2Ek0nFDteMqsQM-Or-TCBkp424uyCKbWjNbJ7MpUo

export const supabase = createClient(supabaseUrl, supabaseKey)