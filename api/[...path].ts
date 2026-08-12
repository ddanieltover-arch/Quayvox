import type { VercelRequest, VercelResponse } from '@vercel/node';
import { routeRequest } from './_lib/router';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await routeRequest(req, res);
  } catch (err) {
    console.error('api router', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
