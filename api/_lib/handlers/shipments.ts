import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { isServerConfigured, requireAdmin } from '../auth';
import { handleOptions } from '../http';
import { sendShipmentCreatedEmails, sendShipmentUpdateEmails } from '../notify';
import {
  deleteShipment,
  getShipmentById,
  insertEvent,
  insertShipment,
  insertShipmentPosition,
  listShipments,
  updateShipment,
} from '../shipments';

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
    origin_lat: nullableNumber,
    origin_lng: nullableNumber,
    destination_lat: nullableNumber,
    destination_lng: nullableNumber,
    current_lat: nullableNumber,
    current_lng: nullableNumber,
    position_label: z.string().trim().max(200).nullable().optional(),
    eventMessage: z.string().optional(),
    eventLocation: z.string().optional(),
    notifyCustomer: z.boolean().optional(),
  })
  .strict();

export async function handleShipmentsCollection(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handleOptions(req, res, 'GET, POST, OPTIONS')) return;

  if (!isServerConfigured()) {
    res.status(503).json({ error: 'Server is not configured', configured: false });
    return;
  }

  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    try {
      const rows = await listShipments();
      res.status(200).json({ shipments: rows });
    } catch (err) {
      console.error('list shipments', err);
      res.status(500).json({ error: 'Failed to load shipments' });
    }
    return;
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
      res.status(400).json({ error: 'Invalid shipment payload', details: parsed.error.flatten() });
      return;
    }

    try {
      const row = await insertShipment(parsed.data);
      if (!row) {
        res.status(500).json({ error: 'Failed to create shipment' });
        return;
      }

      await insertEvent({
        shipment_id: row.id as string,
        status: parsed.data.status,
        location: parsed.data.origin,
        message: 'Shipment created',
      });

      const emailResult = await sendShipmentCreatedEmails(row as Record<string, unknown>);

      res.status(201).json({
        shipment: row,
        emails: {
          customerSent: emailResult.customerSent,
          adminSent: emailResult.adminSent,
        },
      });
    } catch (err) {
      console.error('create shipment', err);
      res.status(500).json({ error: 'Failed to create shipment' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export async function handleShipmentById(
  req: VercelRequest,
  res: VercelResponse,
  id: string
): Promise<void> {
  if (handleOptions(req, res, 'PATCH, DELETE, OPTIONS')) return;

  if (!isServerConfigured()) {
    res.status(503).json({ error: 'Server is not configured', configured: false });
    return;
  }

  if (!requireAdmin(req, res)) return;

  if (!id) {
    res.status(400).json({ error: 'Missing shipment id' });
    return;
  }

  if (req.method === 'DELETE') {
    try {
      await deleteShipment(id);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('delete shipment', err);
      res.status(500).json({ error: 'Failed to delete shipment' });
    }
    return;
  }

  if (req.method === 'PATCH') {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid update payload', details: parsed.error.flatten() });
      return;
    }

    const { eventMessage, eventLocation, position_label, notifyCustomer, ...patch } = parsed.data;

    const hasCurrentLat = Object.prototype.hasOwnProperty.call(parsed.data, 'current_lat');
    const hasCurrentLng = Object.prototype.hasOwnProperty.call(parsed.data, 'current_lng');
    if ((hasCurrentLat || hasCurrentLng) && !(hasCurrentLat && hasCurrentLng)) {
      res.status(400).json({ error: 'current_lat and current_lng must be set together' });
      return;
    }
    if (
      hasCurrentLat &&
      hasCurrentLng &&
      parsed.data.current_lat != null &&
      parsed.data.current_lng == null
    ) {
      res.status(400).json({ error: 'current_lat and current_lng must both be numbers or both null' });
      return;
    }

    try {
      const before = await getShipmentById(id);
      if (!before) {
        res.status(404).json({ error: 'Shipment not found' });
        return;
      }

      const row = await updateShipment(id, patch);
      if (!row) {
        res.status(404).json({ error: 'Shipment not found' });
        return;
      }

      const lat = row.current_lat != null ? Number(row.current_lat) : null;
      const lng = row.current_lng != null ? Number(row.current_lng) : null;
      if (hasCurrentLat && hasCurrentLng && lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
        await insertShipmentPosition({
          shipment_id: id,
          lat,
          lng,
          label: position_label ?? eventLocation ?? null,
        });
      }

      if (eventMessage || parsed.data.status) {
        await insertEvent({
          shipment_id: id,
          status: (row.status as string) || null,
          location:
            eventLocation ||
            position_label ||
            (lat != null && lng != null ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : null) ||
            (row.destination as string) ||
            null,
          message: eventMessage || `Status updated to ${row.status}`,
        });
      }

      const emailResult = await sendShipmentUpdateEmails(
        before as Record<string, unknown>,
        row as Record<string, unknown>,
        patch,
        {
          notifyCustomer: notifyCustomer ?? false,
          eventMessage,
          eventLocation,
          positionLabel: position_label,
        }
      );

      res.status(200).json({
        shipment: row,
        emails: {
          customerSent: emailResult.customerSent,
          adminSent: emailResult.adminSent,
          contexts: emailResult.contexts,
        },
      });
    } catch (err) {
      console.error('update shipment', err);
      res.status(500).json({ error: 'Failed to update shipment' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
