// app/api/activities/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseAdmin();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url);
    const withStats = searchParams.get('stats') === 'true';
    const period = searchParams.get('period') || 'week';

    // Если нужна статистика
    if (withStats) {
      // Получаем все активности пользователя
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (activitiesError) {
        return NextResponse.json({ error: activitiesError.message }, { status: 500 });
      }

      // Получаем все временные записи пользователя
      const { data: entries, error: entriesError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id);

      if (entriesError) {
        return NextResponse.json({ error: entriesError.message }, { status: 500 });
      }

      // Вычисляем дату начала периода
      const now = new Date();
      let startDate: Date;
      if (period === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
      }

      // Агрегируем статистику по активностям
      const stats = activities.map(activity => {
        const activityEntries = entries.filter(e => 
          e.activity_id === activity.id && 
          new Date(e.date) >= startDate
        );
        const totalDuration = activityEntries.reduce((sum, e) => sum + e.duration, 0);
        const entriesCount = activityEntries.length;
        
        return {
          ...activity,
          totalDuration,
          entriesCount
        };
      });

      // Сортируем по убыванию времени
      stats.sort((a, b) => b.totalDuration - a.totalDuration);
      
      return NextResponse.json(stats);
    }

    // Обычный запрос (без статистики)
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (activitiesError) {
      return NextResponse.json({ error: activitiesError.message }, { status: 500 });
    }

    return NextResponse.json(activities);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseAdmin();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { name, icon, color } = await request.json();

    const { data: activity, error: insertError } = await supabase
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
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}