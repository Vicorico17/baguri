import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'baguri_admin_session';

export function hasAdminSession(request: NextRequest): boolean {
  return request.cookies.get(ADMIN_SESSION_COOKIE)?.value === 'authenticated';
}

export function requireAdminSession(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

