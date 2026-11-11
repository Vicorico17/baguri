import {rateLimit} from '@/lib/server/rateLimit';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/server/supabase';

export async function POST(req: NextRequest) {
  const limited=await rateLimit(req,'waitlist',5);if(limited)return limited;
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const { email } = await req.json();
  if (typeof email !== 'string' || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
