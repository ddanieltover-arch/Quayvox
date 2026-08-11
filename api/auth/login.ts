import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import {
  isAuthConfigured,
  setSessionCookie,
  signSession,
  verifyAdminPassword,
} from '../_lib/auth';
import { handleOptions } from '../_lib/http';

const bodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res, 'POST, OPTIONS')) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isAuthConfigured()) {
    return res.status(503).json({
      error: 'Auth is not configured',
      configured: false,
    });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid credentials payload' });
  }

  const { email, password } = parsed.data;
  const ok = await verifyAdminPassword(email, password);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signSession(email.trim().toLowerCase());
  setSessionCookie(res, token);
  return res.status(200).json({
    ok: true,
    user: { email: email.trim().toLowerCase() },
    role: 'admin',
  });
}
