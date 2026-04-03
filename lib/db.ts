// lib/db.ts
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dataDir = path.join(process.cwd(), 'data');
const activitiesPath = path.join(dataDir, 'activities.json');
const timeEntriesPath = path.join(dataDir, 'time_entries.json');

interface Activity {
  id: string;
  name: string;
  icon: string;
  color: number;
  created_at: string;
  is_active: number;
}

interface TimeEntry {
  id: string;
  activity_id: string;
  duration: number;
  date: string;
  note: string | null;
  created_at: string;
}

function initDataFiles() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(activitiesPath)) {
    const defaultActivities: Activity[] = [
      { id: 'test-1', name: 'Английский', icon: '🇬🇧', color: 0x9B7BFF, created_at: new Date().toISOString(), is_active: 1 },
      { id: 'test-2', name: 'Спорт', icon: '💪', color: 0x4CAF50, created_at: new Date().toISOString(), is_active: 1 },
      { id: 'test-3', name: 'Программирование', icon: '💻', color: 0xFF5722, created_at: new Date().toISOString(), is_active: 1 },
      { id: 'test-4', name: 'Гитара', icon: '🎸', color: 0xFFC107, created_at: new Date().toISOString(), is_active: 1 }
    ];
    fs.writeFileSync(activitiesPath, JSON.stringify(defaultActivities, null, 2));
  }

  if (!fs.existsSync(timeEntriesPath)) {
    fs.writeFileSync(timeEntriesPath, JSON.stringify([], null, 2));
  }
}

function readActivities(): Activity[] {
  initDataFiles();
  return JSON.parse(fs.readFileSync(activitiesPath, 'utf-8'));
}

function writeActivities(activities: Activity[]) {
  fs.writeFileSync(activitiesPath, JSON.stringify(activities, null, 2));
}

function readTimeEntries(): TimeEntry[] {
  initDataFiles();
  return JSON.parse(fs.readFileSync(timeEntriesPath, 'utf-8'));
}

function writeTimeEntries(entries: TimeEntry[]) {
  fs.writeFileSync(timeEntriesPath, JSON.stringify(entries, null, 2));
}

export async function getActivities(): Promise<Activity[]> {
  return readActivities().filter(a => a.is_active === 1);
}

export async function createActivity(name: string, icon: string, color: number): Promise<Activity> {
  const activities = readActivities();
  const newActivity: Activity = {
    id: uuidv4(),
    name,
    icon,
    color,
    created_at: new Date().toISOString(),
    is_active: 1
  };
  activities.push(newActivity);
  writeActivities(activities);
  return newActivity;
}

export async function deleteActivity(id: string): Promise<void> {
  const activities = readActivities().filter(a => a.id !== id);
  writeActivities(activities);
}

export async function getTimeEntries(period?: 'today'): Promise<TimeEntry[]> {
  const entries = readTimeEntries();
  if (period === 'today') {
    const today = new Date().toISOString().split('T')[0];
    return entries.filter(e => e.date === today);
  }
  // Без параметра возвращаем ВСЕ записи
  return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const entries = readTimeEntries().filter(e => e.id !== id);
  writeTimeEntries(entries);
}

export async function createTimeEntry(activityId: string, duration: number, date: string, note?: string): Promise<TimeEntry> {
  const entries = readTimeEntries();
  const newEntry: TimeEntry = {
    id: uuidv4(),
    activity_id: activityId,
    duration,
    date,
    note: note || null,
    created_at: new Date().toISOString()
  };
  entries.push(newEntry);
  writeTimeEntries(entries);
  return newEntry;
}