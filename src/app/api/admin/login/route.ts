import {createHash,timingSafeEqual} from 'node:crypto';
import {rateLimit} from '@/lib/server/rateLimit';
import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionValue,
  getAdminSessionMaxAgeSeconds,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const limited=await rateLimit(request,'admin-login',5);if(limited)return limited;
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredPassword) {
    return NextResponse.json(
      { error: 'Admin login is not configured' },
      { status: 500 }
    );
  }

  const { password } = await request.json().catch(() => ({ password: '' }));

  if (typeof password !== 'string' || !timingSafeEqual(createHash('sha256').update(password).digest(),createHash('sha256').update(configuredPassword).digest())) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const sessionValue = await createAdminSessionValue();
  if (!sessionValue) {
    return NextResponse.json(
      { error: 'Admin session is not configured' },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: getAdminSessionMaxAgeSeconds(),
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}
