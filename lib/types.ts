// lib/types.ts
export interface Activity {
  id: string;
  name: string;
  icon: string;
  color: number;
  created_at: string;
  is_active: number;
}

export interface TimeEntry {
  id: string;
  activity_id: string;
  duration: number;
  date: string;
  note: string | null;
  created_at: string;
}

export interface ActivityWithStats extends Activity {
  totalDuration: number;
  entriesCount: number;
}