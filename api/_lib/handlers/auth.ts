import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import {
  getSession,
  isAuthConfigured,
  isServerConfigured,
  setSessionCookie,
  signSession,
  verifyAdminPassword,
  clearSessionCookie,
} from '../auth';
import { isDbConfigured } from '../db';
import { handleOptions } from '../http';

export async function handleAuthMe(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handleOptions(req, res, 'GET, OPTIONS')) return;
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const configured = isServerConfigured();
  if (!configured) {
    res.status(503).json({
      configured: false,
      authConfigured: isAuthConfigured(),
      dbConfigured: isDbConfigured(),
      user: null,
      role: null,
    });
    return;
  }

  const session = getSession(req);
  if (!session) {
    res.status(200).json({
      configured: true,
      user: null,
      role: null,
    });
    return;
  }

  res.status(200).json({
    configured: true,
    user: { email: session.email },
    role: 'admin',
  });
}

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

export async function handleAuthLogin(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handleOptions(req, res, 'POST, OPTIONS')) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isAuthConfigured()) {
    res.status(503).json({
      error: 'Auth is not configured',
      configured: false,
    });
    return;
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid credentials payload' });
    return;
  }

  const { email, password } = parsed.data;
  const ok = await verifyAdminPassword(email, password);
  if (!ok) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signSession(email.trim().toLowerCase());
  setSessionCookie(res, token);
  res.status(200).json({
    ok: true,
    user: { email: email.trim().toLowerCase() },
    role: 'admin',
  });
}

export async function handleAuthLogout(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handleOptions(req, res, 'POST, OPTIONS')) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  clearSessionCookie(res);
  res.status(200).json({ ok: true });
}
