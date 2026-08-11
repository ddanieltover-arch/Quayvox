import { getSql } from './db';

const UPDATE_COLUMNS = new Set([
  'tracking_number',
  'origin',
  'destination',
  'carrier',
  'status',
  'weight',
  'dim_l',
  'dim_w',
  'dim_h',
  'cost',
  'eta',
  'progress',
  'mode',
  'priority',
  'shipper',
  'consignee',
  'documents',
  'tags',
  'customer_email',
  'notes',
]);

export async function listShipments() {
  const sql = getSql();
  return sql`select * from public.shipments order by created_at desc`;
}

export async function getShipmentById(id: string) {
  const sql = getSql();
  const rows = await sql`select * from public.shipments where id = ${id} limit 1`;
  return rows[0] ?? null;
}

export async function getShipmentByTracking(tracking: string) {
  const sql = getSql();
  const trimmed = tracking.trim();
  const rows = await sql`
    select * from public.shipments
    where tracking_number = ${trimmed}
       or tracking_number = ${trimmed.toUpperCase()}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function getEventsByShipmentId(shipmentId: string) {
  const sql = getSql();
  return sql`
    select * from public.shipment_events
    where shipment_id = ${shipmentId}
    order by occurred_at desc
  `;
}

export async function getEventsByTracking(tracking: string) {
  const sql = getSql();
  const trimmed = tracking.trim();
  return sql`
    select e.*
    from public.shipment_events e
    join public.shipments s on s.id = e.shipment_id
    where s.tracking_number = ${trimmed}
       or s.tracking_number = ${trimmed.toUpperCase()}
    order by e.occurred_at desc
  `;
}

export async function insertShipment(payload: Record<string, unknown>) {
  const sql = getSql();
  const rows = await sql`
    insert into public.shipments (
      tracking_number, origin, destination, carrier, status, weight,
      dim_l, dim_w, dim_h, cost, eta, progress, mode, priority,
      shipper, consignee, documents, tags, customer_email, notes
    ) values (
      ${payload.tracking_number as string},
      ${payload.origin as string},
      ${payload.destination as string},
      ${payload.carrier as string},
      ${payload.status as string},
      ${payload.weight as number},
      ${payload.dim_l as number},
      ${payload.dim_w as number},
      ${payload.dim_h as number},
      ${payload.cost as number},
      ${payload.eta as string | null},
      ${payload.progress as number},
      ${payload.mode as string},
      ${payload.priority as string},
      ${payload.shipper as string},
      ${payload.consignee as string},
      ${payload.documents as string[]},
      ${payload.tags as string[]},
      ${payload.customer_email as string | null},
      ${payload.notes as string | null}
    )
    returning *
  `;
  return rows[0] ?? null;
}

export async function updateShipment(id: string, patch: Record<string, unknown>) {
  const existing = (await getShipmentById(id)) as Record<string, unknown> | null;
  if (!existing) return null;

  const merged: Record<string, unknown> = { ...existing };
  for (const [key, value] of Object.entries(patch)) {
    if (UPDATE_COLUMNS.has(key)) merged[key] = value;
  }

  const sql = getSql();
  const rows = await sql`
    update public.shipments set
      tracking_number = ${merged.tracking_number as string},
      origin = ${merged.origin as string},
      destination = ${merged.destination as string},
      carrier = ${merged.carrier as string},
      status = ${merged.status as string},
      weight = ${merged.weight as number},
      dim_l = ${merged.dim_l as number},
      dim_w = ${merged.dim_w as number},
      dim_h = ${merged.dim_h as number},
      cost = ${merged.cost as number},
      eta = ${merged.eta as string | null},
      progress = ${merged.progress as number},
      mode = ${merged.mode as string},
      priority = ${merged.priority as string},
      shipper = ${merged.shipper as string},
      consignee = ${merged.consignee as string},
      documents = ${merged.documents as string[]},
      tags = ${merged.tags as string[]},
      customer_email = ${merged.customer_email as string | null},
      notes = ${merged.notes as string | null}
    where id = ${id}
    returning *
  `;
  return rows[0] ?? null;
}

export async function deleteShipment(id: string) {
  const sql = getSql();
  await sql`delete from public.shipments where id = ${id}`;
}

export async function insertEvent(input: {
  shipment_id: string;
  status: string | null;
  location: string | null;
  message: string;
}) {
  const sql = getSql();
  const rows = await sql`
    insert into public.shipment_events (shipment_id, status, location, message)
    values (
      ${input.shipment_id},
      ${input.status},
      ${input.location},
      ${input.message}
    )
    returning *
  `;
  return rows[0] ?? null;
}

export async function insertContactMessage(input: {
  name: string;
  email: string;
  company: string | null;
  message: string;
}) {
  const sql = getSql();
  await sql`
    insert into public.contact_messages (name, email, company, message)
    values (${input.name}, ${input.email}, ${input.company}, ${input.message})
  `;
}
