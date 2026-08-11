import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { isServerConfigured, requireAdmin } from '../_lib/auth';
import { handleOptions } from '../_lib/http';
import { deleteShipment, insertEvent, updateShipment } from '../_lib/shipments';

const patchSchema = z
  .object({
    tracking_number: z.string().trim().min(3).max(64).optional(),
    origin: z.string().trim().min(1).optional(),
    destination: z.string().trim().min(1).optional(),
    carrier: z.string().trim().min(1).optional(),
    status: z.enum(['Pending', 'In Transit', 'Customs', 'Delivered', 'Exception']).optional(),
    weight: z.number().optional(),
    dim_l: z.number().optional(),
    dim_w: z.number().optional(),
    dim_h: z.number().optional(),
    cost: z.number().optional(),
    eta: z.string().nullable().optional(),
    progress: z.number().int().min(0).max(100).optional(),
    mode: z.enum(['Air', 'Ocean', 'Rail', 'Road']).optional(),
    priority: z.enum(['Express', 'Standard', 'Economy']).optional(),
    shipper: z.string().optional(),
    consignee: z.string().optional(),
    documents: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    customer_email: z.string().email().nullable().optional(),
    notes: z.string().nullable().optional(),
    eventMessage: z.string().optional(),
    eventLocation: z.string().optional(),
  })
  .strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res, 'PATCH, DELETE, OPTIONS')) return;

  if (!isServerConfigured()) {
    return res.status(503).json({ error: 'Server is not configured', configured: false });
  }

  if (!requireAdmin(req, res)) return;

  const id = String(req.query.id || '');
  if (!id) return res.status(400).json({ error: 'Missing shipment id' });

  if (req.method === 'DELETE') {
    try {
      await deleteShipment(id);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('delete shipment', err);
      return res.status(500).json({ error: 'Failed to delete shipment' });
    }
  }

  if (req.method === 'PATCH') {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid update payload', details: parsed.error.flatten() });
    }

    const { eventMessage, eventLocation, ...patch } = parsed.data;

    try {
      const row = await updateShipment(id, patch);
      if (!row) return res.status(404).json({ error: 'Shipment not found' });

      if (eventMessage || parsed.data.status) {
        await insertEvent({
          shipment_id: id,
          status: (row.status as string) || null,
          location: eventLocation || (row.destination as string) || null,
          message: eventMessage || `Status updated to ${row.status}`,
        });
      }

      return res.status(200).json({ shipment: row });
    } catch (err) {
      console.error('update shipment', err);
      return res.status(500).json({ error: 'Failed to update shipment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
