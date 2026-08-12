import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDbConfigured } from '../db';
import { handleOptions } from '../http';
import {
  getEventsByTracking,
  getShipmentByTracking,
  listShipmentPositions,
} from '../shipments';

export async function handleTrack(
  req: VercelRequest,
  res: VercelResponse,
  trackingNumber: string
): Promise<void> {
  if (handleOptions(req, res, 'GET, OPTIONS')) return;
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isDbConfigured()) {
    res.status(503).json({ error: 'Database is not configured' });
    return;
  }

  const trimmed = trackingNumber.trim();
  if (!trimmed) {
    res.status(400).json({ error: 'Tracking number required' });
    return;
  }

  try {
    const shipment = await getShipmentByTracking(trimmed);
    if (!shipment) {
      res.status(404).json({ error: 'Not found', shipment: null, events: [], positions: [] });
      return;
    }
    const events = await getEventsByTracking(trimmed);
    const positions = await listShipmentPositions(shipment.id as string, 50);
    const trail = [...positions].reverse();
    res.status(200).json({ shipment, events, positions: trail });
  } catch (err) {
    console.error('track', err);
    res.status(500).json({ error: 'Failed to load tracking data' });
  }
}
