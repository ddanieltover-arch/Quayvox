import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession, isAuthConfigured, isServerConfigured } from '../_lib/auth';
import { isDbConfigured } from '../_lib/db';
import { handleOptions } from '../_lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res, 'GET, OPTIONS')) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const configured = isServerConfigured();
  if (!configured) {
    return res.status(503).json({
      configured: false,
      authConfigured: isAuthConfigured(),
      dbConfigured: isDbConfigured(),
      user: null,
      role: null,
    });
  }

  const session = getSession(req);
  if (!session) {
    return res.status(200).json({
      configured: true,
      user: null,
      role: null,
    });
  }

  return res.status(200).json({
    configured: true,
    user: { email: session.email },
    role: 'admin',
  });
}
