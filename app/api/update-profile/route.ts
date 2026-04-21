// app/api/update-profile/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, verificationToken, expiresAt } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Проверяем, существует ли профиль
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      // Создаем профиль, если не существует
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: (await supabaseAdmin.auth.admin.getUserById(userId)).data.user?.email,
          verification_token: verificationToken,
          verification_token_expires: expiresAt,
          email_verified: false,
        });

      if (insertError) throw insertError;
    } else {
      // Обновляем существующий профиль
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          verification_token: verificationToken,
          verification_token_expires: expiresAt,
          email_verified: false,
        })
        .eq('id', userId);

      if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}