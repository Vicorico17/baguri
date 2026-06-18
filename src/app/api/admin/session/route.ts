import { NextRequest, NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: await hasAdminSession(request) });
}
