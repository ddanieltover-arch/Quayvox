import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { geocodeAddress } from '../geocode';
import { handleOptions } from '../http';

const querySchema = z.object({
  q: z.string().trim().min(2).max(300),
});

export async function handleGeocode(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handleOptions(req, res, 'GET, OPTIONS')) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const parsed = querySchema.safeParse({
    q: typeof req.query.q === 'string' ? req.query.q : '',
  });
  if (!parsed.success) {
    res.status(400).json({ error: 'Missing address query (q)' });
    return;
  }

  try {
    const coords = await geocodeAddress(parsed.data.q);
    if (!coords) {
      res.status(200).json({ lat: null, lng: null, found: false });
      return;
    }
    res.status(200).json({ lat: coords[0], lng: coords[1], found: true });
  } catch (err) {
    console.error('geocode', err);
    res.status(500).json({ error: 'Failed to geocode address' });
  }
}
