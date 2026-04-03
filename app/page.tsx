// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');

  const handleStart = () => {
    if (name.trim()) {
      localStorage.setItem('userName', name);
    }
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-purple-400 mb-4">LVLUP-IRL</h1>
          <p className="text-xl text-gray-300">Трекер времени для саморазвития. Как в Steam, но для реальной жизни</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 mb-12 border border-gray-700">
          <div className="grid md:grid-cols-3 gap-8 text-center mb-8">
            <div><div className="text-4xl mb-3">🎯</div><h3 className="font-semibold text-gray-200 mb-2">1 клик</h3><p className="text-gray-400 text-sm">Добавляй время в одно касание</p></div>
            <div><div className="text-4xl mb-3">📊</div><h3 className="font-semibold text-gray-200 mb-2">Статистика</h3><p className="text-gray-400 text-sm">Следи за прогрессом</p></div>
            <div><div className="text-4xl mb-3">🎮</div><h3 className="font-semibold text-gray-200 mb-2">Геймификация</h3><p className="text-gray-400 text-sm">Мотивация как в играх</p></div>
          </div>

          <div className="max-w-md mx-auto">
            <input type="text" placeholder="Как к тебе обращаться?" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400" value={name} onChange={(e) => setName(e.target.value)} />
            <button onClick={handleStart} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">Начать трекинг</button>
          </div>
        </div>
      </div>
    </main>
  );
}