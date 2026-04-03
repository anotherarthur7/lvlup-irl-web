// app/activities/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const icons = ['🇬🇧', '💪', '💻', '🎸', '🏃', '📚', '🎨', '🧘', '⚽', '🎹'];
const colors = [0x9B7BFF, 0x4CAF50, 0xFF5722, 0xFFC107, 0x2196F3, 0xE91E63];

export default function NewActivityPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(icons[0]);
  const [color, setColor] = useState(colors[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon, color })
      });
      if (res.ok) router.push('/activities');
      else alert('Ошибка');
    } catch (error) { alert('Ошибка'); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Новая активность</h1>
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-6">
          <div><label className="block text-gray-300 mb-2">Название</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" required placeholder="Английский, Спорт..." /></div>
          <div><label className="block text-gray-300 mb-2">Иконка</label><div className="grid grid-cols-5 gap-3">{icons.map((i) => (<button key={i} type="button" onClick={() => setIcon(i)} className={`text-3xl p-2 rounded-lg ${icon === i ? 'bg-purple-900 ring-2 ring-purple-500' : 'bg-gray-700'}`}>{i}</button>))}</div></div>
          <div><label className="block text-gray-300 mb-2">Цвет</label><div className="flex gap-3">{colors.map((c) => (<button key={c} type="button" onClick={() => setColor(c)} className={`w-10 h-10 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`} style={{ backgroundColor: `#${c.toString(16).padStart(6, '0')}` }} />))}</div></div>
          <div className="flex gap-4"><button type="submit" disabled={loading} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">{loading ? 'Создание...' : 'Сохранить'}</button><button type="button" onClick={() => router.back()} className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">Отмена</button></div>
        </form>
      </div>
    </main>
  );
}