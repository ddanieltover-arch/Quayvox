import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDbConfigured } from '../_lib/db';
import { handleOptions } from '../_lib/http';
import { getEventsByTracking, getShipmentByTracking } from '../_lib/shipments';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res, 'GET, OPTIONS')) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!isDbConfigured()) {
    return res.status(503).json({ error: 'Database is not configured' });
  }

  const trackingNumber = String(req.query.trackingNumber || '').trim();
  if (!trackingNumber) {
    return res.status(400).json({ error: 'Tracking number required' });
  }

  try {
    const shipment = await getShipmentByTracking(trackingNumber);
    if (!shipment) {
      return res.status(404).json({ error: 'Not found', shipment: null, events: [] });
    }
    const events = await getEventsByTracking(trackingNumber);
    return res.status(200).json({ shipment, events });
  } catch (err) {
    console.error('track', err);
    return res.status(500).json({ error: 'Failed to load tracking data' });
  }
}
