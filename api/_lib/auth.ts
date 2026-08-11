import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const COOKIE_NAME = 'qv_session';
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export type AdminSession = { email: string };

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_SECRET && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH
  );
}

export function isServerConfigured(): boolean {
  return isAuthConfigured() && Boolean(process.env.DATABASE_URL);
}

function sign(body: string): string {
  return crypto.createHmac('sha256', process.env.AUTH_SECRET!).update(body).digest('base64url');
}

export function signSession(email: string): string {
  const payload = JSON.stringify({
    email,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  });
  const body = Buffer.from(payload).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifySession(token: string): AdminSession | null {
  if (!process.env.AUTH_SECRET) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      email?: string;
      exp?: number;
    };
    if (!data.email || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

export function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((part) => {
      const [k, ...rest] = part.trim().split('=');
      return [k, decodeURIComponent(rest.join('=') || '')];
    })
  );
}

export function getSession(req: VercelRequest): AdminSession | null {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;
  return verifySession(token);
}

export function requireAdmin(req: VercelRequest, res: VercelResponse): AdminSession | null {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return session;
}

function cookieFlags(): string {
  const parts = ['Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${MAX_AGE_SEC}`];
  if (process.env.VERCEL_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

export function setSessionCookie(res: VercelResponse, token: string): void {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieFlags()}`);
}

export function clearSessionCookie(res: VercelResponse): void {
  const parts = ['Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (process.env.VERCEL_ENV === 'production') parts.push('Secure');
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; ${parts.join('; ')}`);
}

export async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL!;
  // Strip quotes in case .env kept them; bcrypt hashes must keep their $ characters
  const hash = (process.env.ADMIN_PASSWORD_HASH || '').replace(/^['"]|['"]$/g, '');
  if (!hash) return false;
  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return false;
  return bcrypt.compare(password, hash);
}
