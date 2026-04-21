// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Названия переменных должны полностью совпадать с теми, что в .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('supabaseUrl and supabaseAnonKey are required. Check your environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)