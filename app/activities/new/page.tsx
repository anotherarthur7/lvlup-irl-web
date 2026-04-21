// app/activities/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

const icons = ['🇬🇧', '💪', '💻', '🎸', '🏃', '📚', '🎨', '🧘', '⚽', '🎹'];
const colors = [0x9B7BFF, 0x4CAF50, 0xFF5722, 0xFFC107, 0x2196F3, 0xE91E63];

export default function NewActivityPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(icons[0]);
  const [color, setColor] = useState(colors[0]);
  const [loading, setLoading] = useState(false);
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
        router.push('/');
      } else {
        setUserId(session.user.id);
      }
    };
    checkSession();

    // Исправлено: добавлены типы для параметров
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!session) {
          router.push('/');
        } else {
          setUserId(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, isClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Пользователь не авторизован');
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          name,
          icon,
          color,
          is_active: true,
          user_id: userId
        });

      if (error) throw error;
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка при создании активности');
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Загрузка...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Новая активность</h1>
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Название</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
              required
              placeholder="Английский, Спорт..."
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Иконка</label>
            <div className="grid grid-cols-5 gap-3">
              {icons.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`text-3xl p-2 rounded-lg ${icon === i ? 'bg-purple-900 ring-2 ring-purple-500' : 'bg-gray-700'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Цвет</label>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
                  style={{ backgroundColor: `#${c.toString(16).padStart(6, '0')}` }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}