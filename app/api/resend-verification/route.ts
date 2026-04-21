// app/api/resend-verification/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const generateVerificationToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Находим профиль по email
    const { data: profile, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Генерируем новый токен
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Обновляем токен в профиле
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        verification_token: verificationToken,
        verification_token_expires: expiresAt.toISOString(),
        email_verified: false,
      })
      .eq('id', profile.id);

    if (updateError) throw updateError;

    // Отправляем письмо
    const verificationLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    // Здесь нужно вызвать твой email API
    await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'Подтверждение email — LVLUP-IRL',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #9B7BFF;">Подтверждение email</h2>
            <p>Для подтверждения email нажмите на кнопку ниже:</p>
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #9B7BFF; color: white; text-decoration: none; border-radius: 8px;">Подтвердить email</a>
            <p style="margin-top: 20px; color: #666;">Ссылка действительна 24 часа.</p>
          </div>
        `,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}