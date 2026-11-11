import { NextResponse } from 'next/server';
import { startOAuth } from '@/lib/server/socialOAuth';
export async function GET() { try { return startOAuth('tiktok'); } catch { return NextResponse.json({error:'Sign-in is not configured'},{status:503}); } }
