import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { isServerConfigured, requireAdmin } from './_lib/auth';
import { handleOptions } from './_lib/http';
import { insertEvent, insertShipment, listShipments } from './_lib/shipments';

const nullableNumber = z.number().finite().nullable().optional();

const createSchema = z.object({
  tracking_number: z.string().trim().min(3).max(64),
  origin: z.string().trim().min(1),
  destination: z.string().trim().min(1),
  carrier: z.string().trim().min(1),
  status: z.enum(['Pending', 'In Transit', 'Customs', 'Delivered', 'Exception']),
  weight: z.number(),
  dim_l: z.number(),
  dim_w: z.number(),
  dim_h: z.number(),
  cost: z.number(),
  eta: z.string().nullable().optional(),
  progress: z.number().int().min(0).max(100),
  mode: z.enum(['Air', 'Ocean', 'Rail', 'Road']),
  priority: z.enum(['Express', 'Standard', 'Economy']),
  shipper: z.string(),
  consignee: z.string(),
  documents: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  customer_email: z.string().email().nullable().optional(),
  notes: z.string().nullable().optional(),
  origin_lat: nullableNumber,
  origin_lng: nullableNumber,
  destination_lat: nullableNumber,
  destination_lng: nullableNumber,
  current_lat: nullableNumber,
  current_lng: nullableNumber,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res, 'GET, POST, OPTIONS')) return;

  if (!isServerConfigured()) {
    return res.status(503).json({ error: 'Server is not configured', configured: false });
  }

  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    try {
      const rows = await listShipments();
      return res.status(200).json({ shipments: rows });
    } catch (err) {
      console.error('list shipments', err);
      return res.status(500).json({ error: 'Failed to load shipments' });
    }
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse({
      ...req.body,
      documents: req.body?.documents ?? [],
      tags: req.body?.tags ?? [],
      customer_email: req.body?.customer_email ?? null,
      notes: req.body?.notes ?? null,
      eta: req.body?.eta ?? null,
    });
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid shipment payload', details: parsed.error.flatten() });
    }

    try {
      const row = await insertShipment(parsed.data);
      if (!row) return res.status(500).json({ error: 'Failed to create shipment' });

      await insertEvent({
        shipment_id: row.id as string,
        status: parsed.data.status,
        location: parsed.data.origin,
        message: 'Shipment created',
      });

      return res.status(201).json({ shipment: row });
    } catch (err) {
      console.error('create shipment', err);
      return res.status(500).json({ error: 'Failed to create shipment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
