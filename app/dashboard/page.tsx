// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Activity, TimeEntry } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      
      setUserId(session.user.id);
      setUserName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Пользователь');
      
      // Проверяем верификацию через API
      try {
        const verifyResponse = await fetch(`/api/check-verification?userId=${session.user.id}`);
        const verifyData = await verifyResponse.json();
        
        if (!verifyData.verified) {
          router.replace('/verify-pending');
          return;
        }
      } catch (err) {
        console.error('Verification check failed:', err);
      }
      
      setLoading(false);
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!session) {
          router.replace('/');
        } else {
          setUserId(session.user.id);
          setUserName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Пользователь');
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, isClient]);

  // Загружаем данные только когда есть userId
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      const today = new Date().toISOString().split('T')[0];
      const { data: entriesData, error: entriesError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (entriesError) throw entriesError;

      setActivities(activitiesData || []);
      setTodayEntries(entriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addTimeEntry = async (activityId: string, duration: number) => {
    if (!userId) {
      alert('Пользователь не авторизован');
      return;
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('time_entries')
        .insert({
          activity_id: activityId,
          user_id: userId,
          duration,
          date: today,
          note: 'Быстрое добавление',
        });

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error adding time entry:', error);
      alert('Не удалось добавить запись');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const todayTotal = todayEntries.reduce((sum, e) => sum + e.duration, 0);
  const hours = Math.floor(todayTotal / 60);
  const minutes = todayTotal % 60;

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Загрузка...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Привет, {userName}!</h1>
            <p className="text-gray-400">{new Date().toLocaleDateString('ru-RU')}</p>
          </div>
          <div className="flex gap-4">
            <nav className="flex gap-4">
              <Link href="/dashboard" className="text-purple-400 font-medium">Главная</Link>
              <Link href="/activities" className="text-gray-400 hover:text-purple-400">Активности</Link>
              <Link href="/statistics" className="text-gray-400 hover:text-purple-400">Статистика</Link>
            </nav>
            <button onClick={logout} className="text-red-400 hover:text-red-300 text-sm">Выйти</button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow p-6 mb-6 border border-gray-700">
          <h2 className="font-semibold text-white text-lg mb-4">Быстрое добавление</h2>
          <div className="grid grid-cols-4 gap-4">
            {activities.slice(0, 4).map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  const minutes = prompt('Сколько минут?', '30');
                  if (minutes) addTimeEntry(a.id, parseInt(minutes));
                }}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-700 transition"
              >
                <span className="text-3xl mb-2">{a.icon}</span>
                <span className="text-sm text-gray-300">{a.name}</span>
              </button>
            ))}
            <Link
              href="/activities/new"
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-700 transition"
            >
              <span className="text-3xl mb-2 text-purple-400">+</span>
              <span className="text-sm text-gray-300">Добавить</span>
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-white text-lg">Сегодня</h2>
            <span className="text-2xl font-bold text-purple-400">
              {hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`}
            </span>
          </div>
          {todayEntries.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Пока нет записей на сегодня</p>
          ) : (
            <div className="space-y-3">
              {todayEntries.map((e) => {
                const activity = activities.find(a => a.id === e.activity_id);
                return (
                  <div key={e.id} className="flex justify-between items-center py-2 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{activity?.icon || '❓'}</span>
                      <span className="text-gray-300">{activity?.name || 'Неизвестно'}</span>
                    </div>
                    <span className="font-medium text-white">
                      {Math.floor(e.duration / 60)} ч {e.duration % 60} мин
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}