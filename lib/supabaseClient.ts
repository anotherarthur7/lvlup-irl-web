// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Создаем клиент с правильными настройками
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,  // Сохранять сессию в localStorage
    autoRefreshToken: true, // Автоматически обновлять токен
    detectSessionInUrl: true // Обнаруживать сессию в URL (для подтверждения email)
  }
})