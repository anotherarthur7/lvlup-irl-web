// app/api/activities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getActivities, createActivity, deleteActivity } from '@/lib/db';
import { getTimeEntries } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const withStats = searchParams.get('stats') === 'true';
    const period = searchParams.get('period') || 'week';

    // Если нужна статистика
    if (withStats) {
      const activities = await getActivities();
      const entries = await getTimeEntries();
      
      // Фильтруем записи по периоду
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
    const activities = await getActivities();
    return NextResponse.json(activities);
    
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon, color } = body;

    if (!name || !icon) {
      return NextResponse.json({ error: 'Missing name or icon' }, { status: 400 });
    }

    const activity = await createActivity(name, icon, color || 0x9B7BFF);
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await deleteActivity(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}