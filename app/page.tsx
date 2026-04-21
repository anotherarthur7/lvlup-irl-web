// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Генерация случайного токена (без crypto)
const generateVerificationToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
};

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isLogin) {
      // Вход
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
      }
    } else {
      // Регистрация
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || email.split('@')[0] },
        },
      });
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Генерируем токен верификации
        const verificationToken = generateVerificationToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Сохраняем токен в профиль через API (не напрямую в клиенте!)
        const profileResponse = await fetch('/api/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            verificationToken,
            expiresAt: expiresAt.toISOString(),
          }),
        });

        if (profileResponse.ok) {
          // Отправляем письмо с подтверждением
          const verificationLink = `${window.location.origin}/api/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;
          
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email,
              subject: 'Подтверждение email — LVLUP-IRL',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                  <h2 style="color: #9B7BFF;">Подтверждение email</h2>
                  <p>Спасибо за регистрацию в LVLUP-IRL!</p>
                  <p>Для подтверждения email нажмите на кнопку ниже:</p>
                  <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #9B7BFF; color: white; text-decoration: none; border-radius: 8px;">Подтвердить email</a>
                  <p style="margin-top: 20px; color: #666;">Ссылка действительна 24 часа.</p>
                </div>
              `,
            }),
          });
        }

        setMessage('Регистрация успешна! Пожалуйста, подтвердите email. Ссылка отправлена на вашу почту.');
        
        // Не логиним автоматически, ждем подтверждения
        setTimeout(() => {
          router.push('/verify-pending');
        }, 3000);
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-purple-400 mb-4">LVLUP-IRL</h1>
          <p className="text-xl text-gray-300">Трекер времени для саморазвития. Как в Steam, но для реальной жизни</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 mb-12 border border-gray-700 max-w-md mx-auto">
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 rounded-lg ${isLogin ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 rounded-lg ${!isLogin ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Твоё имя"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}