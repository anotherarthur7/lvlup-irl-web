// app/api/check-verification/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('email_verified')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return NextResponse.json({ verified: false });
  }

  return NextResponse.json({ verified: profile.email_verified === true });
}