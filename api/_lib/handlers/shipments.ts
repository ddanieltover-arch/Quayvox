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
const optionalEmail = z
  .union([z.string().email(), z.literal(''), z.null()])
  .optional()
  .transform((v) => (v === '' || v === undefined ? null : v));

const partyFields = {
  sender_name: z.string().optional(),
  sender_phone: z.string().optional(),
  sender_email: optionalEmail,
  sender_address: z.string().optional(),
  sender_street: z.string().optional(),
  sender_city: z.string().optional(),
  sender_state: z.string().nullable().optional(),
  sender_postal: z.string().nullable().optional(),
  sender_country: z.string().optional(),
  receiver_name: z.string().optional(),
  receiver_phone: z.string().optional(),
  receiver_email: optionalEmail,
  receiver_address: z.string().optional(),
  receiver_street: z.string().optional(),
  receiver_city: z.string().optional(),
  receiver_state: z.string().nullable().optional(),
  receiver_postal: z.string().nullable().optional(),
  receiver_country: z.string().optional(),
  current_address: z.string().nullable().optional(),
  departure_at: z.string().nullable().optional(),
  delivery_at: z.string().nullable().optional(),
  volume: z.number().optional(),
  payment_method: z.string().optional(),
};

const createSchema = z.object({
  tracking_number: z.string().trim().min(3).max(64),
  origin: z.string().trim().min(1),
  destination: z.string().trim().min(1),
  carrier: z.string().trim().min(1),
  status: z.enum(['Pending', 'In Transit', 'Customs', 'On Hold', 'Delivered', 'Exception']),
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
  customer_email: optionalEmail,
  notes: z.string().nullable().optional(),
  item_name: z.string().trim().min(1).max(200),
  ...partyFields,
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
    status: z.enum(['Pending', 'In Transit', 'Customs', 'On Hold', 'Delivered', 'Exception']).optional(),
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
    customer_email: optionalEmail,
    notes: z.string().nullable().optional(),
    item_name: z.string().trim().max(200).optional(),
    ...partyFields,
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
      item_name: req.body?.item_name ?? '',
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

      const beforeLat = before.current_lat != null ? Number(before.current_lat) : null;
      const beforeLng = before.current_lng != null ? Number(before.current_lng) : null;
      const lat = row.current_lat != null ? Number(row.current_lat) : null;
      const lng = row.current_lng != null ? Number(row.current_lng) : null;
      const coordsValid = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
      const coordsChanged =
        coordsValid && (beforeLat !== lat || beforeLng !== lng);
      const addressUpdated = Object.prototype.hasOwnProperty.call(parsed.data, 'current_address');

      if (coordsValid && (hasCurrentLat || addressUpdated || coordsChanged)) {
        await insertShipmentPosition({
          shipment_id: id,
          lat,
          lng,
          label:
            position_label ??
            eventLocation ??
            (typeof row.current_address === 'string' ? row.current_address : null),
        });
      }

      if (eventMessage || parsed.data.status) {
        await insertEvent({
          shipment_id: id,
          status: (row.status as string) || null,
          location:
            eventLocation ||
            position_label ||
            (row.current_address as string | null) ||
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
          notifyCustomer: true,
          eventMessage:
            eventMessage?.trim() ||
            (parsed.data.status
              ? `Status updated to ${String(row.status)}`
              : 'Shipment updated'),
          eventLocation:
            eventLocation ||
            position_label ||
            (typeof row.current_address === 'string' ? row.current_address : null),
          positionLabel: position_label,
        }
      );

      res.status(200).json({
        shipment: row,
        emails: {
          customerSent: emailResult.customerSent,
          adminSent: emailResult.adminSent,
          contexts: emailResult.contexts,
          partyEmails: emailResult.partyEmails,
          adminEmail: emailResult.adminEmail,
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
