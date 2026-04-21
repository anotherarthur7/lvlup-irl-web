// app/verify-pending/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function VerifyPendingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    };
    getUserEmail();
  }, []);

  const resendEmail = async () => {
    if (!email) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessage('Письмо отправлено повторно! Проверьте почту.');
      } else {
        setMessage(data.error || 'Ошибка при отправке');
      }
    } catch (error) {
      setMessage('Ошибка при отправке');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl mb-4">✉️</div>
        <h1 className="text-2xl font-bold text-white mb-2">Подтвердите email</h1>
        <p className="text-gray-400 mb-4">
          На почту <strong>{email || 'вашу'}</strong> отправлена ссылка для подтверждения.
        </p>
        <p className="text-gray-400 mb-6">
          После подтверждения вы сможете пользоваться приложением.
        </p>
        {message && (
          <p className={`mb-4 ${message.includes('Ошибка') ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}
        <button
          onClick={resendEmail}
          disabled={loading}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Отправка...' : 'Отправить повторно'}
        </button>
        <div className="mt-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-400 text-sm"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </main>
  );
}