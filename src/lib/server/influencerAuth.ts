import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { supabaseAdmin } from './supabase';
export const INFLUENCER_COOKIE = 'baguri_influencer';
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
export async function requireInfluencer(request: NextRequest) {
  const session = verifySession(request.cookies.get(INFLUENCER_COOKIE)?.value, 'influencer');
  if (!session) return NextResponse.json({ error: 'Please sign in again' }, { status: 401 });
  const {data,error} = await supabaseAdmin.from('influencer_accounts').select('*').eq('id',session.sub).single();
  if(error || !data) return NextResponse.json({error:'Account unavailable'}, {status:401});
  return data as {id:string; provider:string; provider_id:string; display_name:string; username:string; verified:boolean; balance:number; pending_balance:number; stripe_account_id:string|null; iban:string|null};
}
