// app/api/activities/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Инициализируем Supabase клиент на сервере с сервисным ключом для полного доступа
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ВАЖНО: добавить этот ключ в переменные окружения на Render!
);

export async function GET(request: NextRequest) {
  // 1. Получаем токен из заголовка Authorization
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');

  // 2. Проверяем токен и получаем пользователя
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // 3. Получаем активности пользователя из Supabase
  const { data: activities, error: activitiesError } = await supabaseAdmin
    .from('activities')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (activitiesError) {
    return NextResponse.json({ error: activitiesError.message }, { status: 500 });
  }

  return NextResponse.json(activities);
}

export async function POST(request: NextRequest) {
  // 1. Получаем токен из заголовка Authorization
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');

  // 2. Проверяем токен и получаем пользователя
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // 3. Получаем данные из тела запроса
  const { name, icon, color } = await request.json();

  // 4. Создаем активность в Supabase
  const { data: activity, error: insertError } = await supabaseAdmin
    .from('activities')
    .insert({
      name,
      icon,
      color,
      user_id: user.id,
      is_active: true,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(activity);
}