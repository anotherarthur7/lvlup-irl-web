// app/activities/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Activity } from '@/lib/types';

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      } else {
        setUserId(session.user.id);
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetchActivities();
    }
  }, [userId]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteActivity = async (id: string) => {
    if (!confirm('Удалить активность?')) return;
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchActivities();
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка при удалении');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Загрузка...</div>;

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Мои активности</h1>
          <Link href="/activities/new" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">+ Новая активность</Link>
        </div>
        {activities.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-400">У вас пока нет активностей</p>
            <Link href="/activities/new" className="text-purple-400">Создать первую</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a.id} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between border border-gray-700">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{a.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{a.name}</h3>
                    <p className="text-sm text-gray-400">{a.is_active === 1 ? 'Активна' : 'Архивирована'}</p>
                  </div>
                </div>
                <button onClick={() => deleteActivity(a.id)} className="text-red-400 hover:text-red-300">Удалить</button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-purple-400">← На главную</Link>
        </div>
      </div>
    </main>
  );
}