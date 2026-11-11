import { createHmac, timingSafeEqual } from 'node:crypto';
export type Session = { sub: string; purpose: string; exp: number; nonce?: string };
function secret() {
  const key = process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!key || key.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters');
  return key;
}
export function signSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${createHmac('sha256', secret()).update(payload).digest('base64url')}`;
}
export function verifySession(value: string | undefined, purpose: string): Session | null {
  if (!value) return null;
  try {
    const parts = value.split('.');
    if (parts.length !== 2) return null;
    const expected = createHmac('sha256', secret()).update(parts[0]).digest();
    const actual = Buffer.from(parts[1], 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    if (payload.purpose !== purpose || typeof payload.sub !== 'string' || typeof payload.exp !== 'number' || payload.exp <= Date.now()/1000) return null;
    return payload;
  } catch { return null; }
}
