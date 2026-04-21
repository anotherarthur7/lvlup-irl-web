// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Функция для получения переменных окружения с дефолтными значениями
const getSupabaseUrl = () => {
  if (typeof window === 'undefined') {
    // На сервере используем переменные окружения напрямую
    return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  }
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

const getSupabaseAnonKey = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Только проверяем в браузере
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase environment variables');
  // Не выбрасываем ошибку, а логируем
}

// Экспортируем клиент (на сервере может быть null)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;