import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'baguri_admin_session';
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getAdminSessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

function toBase64Url(value: string | Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value).toString('base64url');
  }

  const input = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  let binary = '';
  input.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(normalized, 'base64').toString('utf8');
  }

  return atob(normalized);
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export async function createAdminSessionValue(): Promise<string | null> {
  const secret = getAdminSessionSecret();
  if (!secret) return null;

  const now = Math.floor(Date.now() / 1000);
  const payload = toBase64Url(JSON.stringify({
    v: 1,
    iat: now,
    exp: now + ADMIN_SESSION_MAX_AGE_SECONDS,
    nonce: createNonce(),
  }));
  const signature = await signPayload(payload, secret);

  return `${payload}.${signature}`;
}

export function getAdminSessionMaxAgeSeconds(): number {
  return ADMIN_SESSION_MAX_AGE_SECONDS;
}

export async function hasAdminSession(request: NextRequest): Promise<boolean> {
  const secret = getAdminSessionSecret();
  const value = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!secret || !value) return false;

  const [payload, signature] = value.split('.');
  if (!payload || !signature) return false;

  const expectedSignature = await signPayload(payload, secret);
  if (signature !== expectedSignature) return false;

  try {
    const decoded = JSON.parse(fromBase64Url(payload));
    return typeof decoded.exp === 'number' && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function requireAdminSession(request: NextRequest) {
  if (!(await hasAdminSession(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
