// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, TimeEntry } from '@/lib/types';

export default function DashboardPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(30);

  const timeOptions = [15, 30, 45, 60, 90, 120];

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || 'Пользователь');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activitiesRes, entriesRes] = await Promise.all([
        fetch('/api/activities'),
        fetch('/api/time-entries?period=today')
      ]);
      const activitiesData = await activitiesRes.json();
      const entriesData = await entriesRes.json();
      setActivities(activitiesData);
      setTodayEntries(entriesData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTimeEntry = async (activityId: string, duration: number) => {
    try {
      await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          duration,
          date: new Date().toISOString().split('T')[0],
          note: 'Добавлено через интерфейс'
        })
      });
      setShowTimePicker(false);
      setSelectedActivity(null);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedMinutes(30);
    setShowTimePicker(true);
  };

  // Получаем название активности по ID
  const getActivityName = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    return activity ? activity.name : 'Неизвестная активность';
  };

  const getActivityIcon = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    return activity ? activity.icon : '❓';
  };

  const todayTotal = todayEntries.reduce((sum, e) => sum + e.duration, 0);
  const hours = Math.floor(todayTotal / 60);
  const minutes = todayTotal % 60;

  // Последние 5 записей (самые новые сверху)
  const recentEntries = [...todayEntries].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  const clearEntries = async () => {
    if (!confirm('Удалить все записи за сегодня?')) return;
    try {
      for (const entry of todayEntries) {
        await fetch(`/api/time-entries?id=${entry.id}`, { method: 'DELETE' });
      }
      fetchData();
    } catch (error) {
      console.error('Error clearing entries:', error);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Загрузка...</div>;

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Привет, {userName}!</h1>
            <p className="text-gray-400">{new Date().toLocaleDateString('ru-RU')}</p>
          </div>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-purple-400 font-medium">Главная</Link>
            <Link href="/activities" className="text-gray-400 hover:text-purple-400">Активности</Link>
            <Link href="/statistics" className="text-gray-400 hover:text-purple-400">Статистика</Link>
          </nav>
        </div>

        {/* Быстрое добавление */}
        <div className="bg-gray-800 rounded-xl shadow p-6 mb-6 border border-gray-700">
          <h2 className="font-semibold text-white text-lg mb-4">Быстрое добавление</h2>
          <div className="grid grid-cols-4 gap-4">
            {activities.slice(0, 4).map((a) => (
              <button
                key={a.id}
                onClick={() => handleActivityClick(a)}
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

        {/* Модальное окно выбора времени */}
        {showTimePicker && selectedActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
              <div className="text-center mb-4">
                <span className="text-4xl">{selectedActivity.icon}</span>
                <h3 className="text-xl font-bold text-white mt-2">{selectedActivity.name}</h3>
                <p className="text-gray-400">Сколько времени потратили?</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {timeOptions.map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setSelectedMinutes(minutes)}
                    className={`py-2 px-4 rounded-lg transition ${
                      selectedMinutes === minutes
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {minutes} мин
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => addTimeEntry(selectedActivity.id, selectedMinutes)}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  Добавить
                </button>
                <button
                  onClick={() => {
                    setShowTimePicker(false);
                    setSelectedActivity(null);
                  }}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Сегодняшние записи */}
        <div className="bg-gray-800 rounded-xl shadow p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-white text-lg">Сегодня</h2>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-purple-400">
                {hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`}
              </span>
              {todayEntries.length > 0 && (
                <button
                  onClick={clearEntries}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Очистить всё
                </button>
              )}
            </div>
          </div>
          
          {todayEntries.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Пока нет записей на сегодня</p>
          ) : (
            <div className="space-y-2">
              {recentEntries.map((entry) => {
                const entryHours = Math.floor(entry.duration / 60);
                const entryMinutes = entry.duration % 60;
                return (
                  <div key={entry.id} className="flex justify-between items-center py-2 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getActivityIcon(entry.activity_id)}</span>
                      <span className="text-gray-300">{getActivityName(entry.activity_id)}</span>
                    </div>
                    <span className="font-medium text-white">
                      {entryHours > 0 ? `${entryHours} ч ${entryMinutes} мин` : `${entryMinutes} мин`}
                    </span>
                  </div>
                );
              })}
              {todayEntries.length > 5 && (
                <p className="text-gray-500 text-sm text-center pt-2">
                  + ещё {todayEntries.length - 5} записей
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}