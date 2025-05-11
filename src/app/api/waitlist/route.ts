import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../supabaseClient';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const { error } = await supabase.from('waitlist_emails').insert({ email });
  if (error) {
    if (error.code === '23505') {
      // Unique violation
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 