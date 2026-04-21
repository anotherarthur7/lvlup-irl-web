// app/statistics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { ActivityWithStats } from '@/lib/types';

export default function StatisticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ActivityWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  // Проверяем сессию при загрузке
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      }
    };
    checkSession();
  }, [router]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      const token = session.access_token;
      
      const res = await fetch(`/api/activities?stats=true&period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.status === 401) {
        router.push('/');
        return;
      }
      
      const data = await res.json();
      setStats(data);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchStats(); 
  }, [period]);

  const total = stats.reduce((s, a) => s + (a.totalDuration || 0), 0);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Загрузка...</div>;

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Статистика</h1>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value as 'week' | 'month')} 
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg"
          >
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
          </select>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 mb-6 text-center">
          <p className="text-gray-400 mb-2">Всего времени</p>
          <p className="text-4xl font-bold text-purple-400">
            {hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`}
          </p>
        </div>
        
        {stats.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-400">Нет данных</p>
          </div>
        ) : (
          stats.map((a) => { 
            const ah = Math.floor(a.totalDuration / 60); 
            const am = a.totalDuration % 60; 
            const pct = total > 0 ? (a.totalDuration / total) * 100 : 0; 
            return (
              <div key={a.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{a.icon}</span>
                  <span className="font-semibold text-white flex-1">{a.name}</span>
                  <span className="text-gray-400">{ah > 0 ? `${ah} ч ${am} мин` : `${am} мин`}</span>
                  <span className="text-sm text-gray-500">{Math.round(pct)}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: `#${a.color.toString(16).padStart(6, '0')}` }} />
                </div>
              </div>
            );
          })
        )}
        
        <div className="mt-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-purple-400">← На главную</Link>
        </div>
      </div>
    </main>
  );
}