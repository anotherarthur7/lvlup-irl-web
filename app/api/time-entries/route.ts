// app/api/time-entries/route.ts (добавь DELETE метод)
import { NextRequest, NextResponse } from 'next/server';
import { getTimeEntries, createTimeEntry, deleteTimeEntry } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'today' | null;
    const entries = await getTimeEntries(period || undefined);
    return NextResponse.json(entries);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activityId, duration, date, note } = body;

    if (!activityId || !duration || !date) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const entry = await createTimeEntry(activityId, duration, date, note);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// НОВЫЙ DELETE метод
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await deleteTimeEntry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}