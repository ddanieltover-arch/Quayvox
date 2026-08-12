import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDbConfigured } from '../_lib/db';
import { handleOptions } from '../_lib/http';
import {
  getEventsByTracking,
  getShipmentByTracking,
  listShipmentPositions,
} from '../_lib/shipments';

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
      return res.status(404).json({ error: 'Not found', shipment: null, events: [], positions: [] });
    }
    const events = await getEventsByTracking(trackingNumber);
    const positions = await listShipmentPositions(shipment.id as string, 50);
    // Return chronological trail for the map (oldest → newest)
    const trail = [...positions].reverse();
    return res.status(200).json({ shipment, events, positions: trail });
  } catch (err) {
    console.error('track', err);
    return res.status(500).json({ error: 'Failed to load tracking data' });
  }
}
