// app/verify-pending/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function VerifyPendingPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const resendEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: (await supabase.auth.getSession()).data.session?.user?.email || '',
    });
    
    if (error) {
      setMessage('Ошибка при отправке: ' + error.message);
    } else {
      setMessage('Письмо отправлено повторно!');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Подтвердите email</h1>
        <p className="text-gray-400 mb-6">На вашу почту отправлена ссылка для подтверждения.</p>
        <button
          onClick={resendEmail}
          disabled={loading}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg"
        >
          {loading ? 'Отправка...' : 'Отправить повторно'}
        </button>
        {message && <p className="mt-4 text-green-400">{message}</p>}
      </div>
    </main>
  );
}