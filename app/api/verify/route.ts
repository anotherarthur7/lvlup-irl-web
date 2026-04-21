// app/api/verify/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return new Response('Invalid verification link', { status: 400 });
  }

  try {
    // Находим профиль по email и токену
    const { data: profile, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', decodeURIComponent(email))
      .eq('verification_token', token)
      .single();

    if (findError || !profile) {
      return new Response('Invalid or expired token', { status: 400 });
    }

    // Проверяем срок действия токена
    if (profile.verification_token_expires) {
      const expires = new Date(profile.verification_token_expires);
      if (expires < new Date()) {
        return new Response('Token has expired', { status: 400 });
      }
    }

    // Обновляем статус верификации
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        email_verified: true,
        verification_token: null,
        verification_token_expires: null
      })
      .eq('id', profile.id);

    if (updateError) throw updateError;

    // Перенаправляем на страницу успеха
    return NextResponse.redirect(new URL('/verify-success', request.url));
  } catch (error) {
    console.error('Verification error:', error);
    return new Response('Verification failed', { status: 500 });
  }
}