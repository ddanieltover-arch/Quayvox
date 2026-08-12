import { getSql } from './db';
import { lookupPortCoords } from './geoPorts';

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
  'origin_lat',
  'origin_lng',
  'destination_lat',
  'destination_lng',
  'current_lat',
  'current_lng',
  'current_location_updated_at',
]);

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Fill missing OD coords from the known port lookup when place names match. */
export function resolveGeoDefaults(payload: Record<string, unknown>): Record<string, unknown> {
  const next = { ...payload };
  const origin = typeof next.origin === 'string' ? next.origin : '';
  const destination = typeof next.destination === 'string' ? next.destination : '';

  if (asNullableNumber(next.origin_lat) == null || asNullableNumber(next.origin_lng) == null) {
    const o = lookupPortCoords(origin);
    if (o) {
      next.origin_lat = o[0];
      next.origin_lng = o[1];
    }
  }
  if (asNullableNumber(next.destination_lat) == null || asNullableNumber(next.destination_lng) == null) {
    const d = lookupPortCoords(destination);
    if (d) {
      next.destination_lat = d[0];
      next.destination_lng = d[1];
    }
  }
  return next;
}

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

export async function listShipmentPositions(shipmentId: string, limit = 50) {
  const sql = getSql();
  const capped = Math.min(Math.max(limit, 1), 200);
  return sql`
    select * from public.shipment_positions
    where shipment_id = ${shipmentId}
    order by recorded_at desc
    limit ${capped}
  `;
}

export async function insertShipmentPosition(input: {
  shipment_id: string;
  lat: number;
  lng: number;
  label?: string | null;
  recorded_at?: string | null;
}) {
  const sql = getSql();
  const rows = await sql`
    insert into public.shipment_positions (shipment_id, lat, lng, label, recorded_at)
    values (
      ${input.shipment_id},
      ${input.lat},
      ${input.lng},
      ${input.label ?? null},
      ${input.recorded_at ? new Date(input.recorded_at) : new Date()}
    )
    returning *
  `;
  return rows[0] ?? null;
}

export async function insertShipment(payload: Record<string, unknown>) {
  const sql = getSql();
  const resolved = resolveGeoDefaults(payload);
  const rows = await sql`
    insert into public.shipments (
      tracking_number, origin, destination, carrier, status, weight,
      dim_l, dim_w, dim_h, cost, eta, progress, mode, priority,
      shipper, consignee, documents, tags, customer_email, notes,
      origin_lat, origin_lng, destination_lat, destination_lng,
      current_lat, current_lng, current_location_updated_at
    ) values (
      ${resolved.tracking_number as string},
      ${resolved.origin as string},
      ${resolved.destination as string},
      ${resolved.carrier as string},
      ${resolved.status as string},
      ${resolved.weight as number},
      ${resolved.dim_l as number},
      ${resolved.dim_w as number},
      ${resolved.dim_h as number},
      ${resolved.cost as number},
      ${resolved.eta as string | null},
      ${resolved.progress as number},
      ${resolved.mode as string},
      ${resolved.priority as string},
      ${resolved.shipper as string},
      ${resolved.consignee as string},
      ${resolved.documents as string[]},
      ${resolved.tags as string[]},
      ${resolved.customer_email as string | null},
      ${resolved.notes as string | null},
      ${asNullableNumber(resolved.origin_lat)},
      ${asNullableNumber(resolved.origin_lng)},
      ${asNullableNumber(resolved.destination_lat)},
      ${asNullableNumber(resolved.destination_lng)},
      ${asNullableNumber(resolved.current_lat)},
      ${asNullableNumber(resolved.current_lng)},
      ${resolved.current_location_updated_at
        ? new Date(resolved.current_location_updated_at as string)
        : asNullableNumber(resolved.current_lat) != null
          ? new Date()
          : null}
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

  const withGeo = resolveGeoDefaults(merged);

  const currentChanged =
    Object.prototype.hasOwnProperty.call(patch, 'current_lat') ||
    Object.prototype.hasOwnProperty.call(patch, 'current_lng');
  if (currentChanged && asNullableNumber(withGeo.current_lat) != null && asNullableNumber(withGeo.current_lng) != null) {
    withGeo.current_location_updated_at = new Date().toISOString();
  }

  const sql = getSql();
  const rows = await sql`
    update public.shipments set
      tracking_number = ${withGeo.tracking_number as string},
      origin = ${withGeo.origin as string},
      destination = ${withGeo.destination as string},
      carrier = ${withGeo.carrier as string},
      status = ${withGeo.status as string},
      weight = ${withGeo.weight as number},
      dim_l = ${withGeo.dim_l as number},
      dim_w = ${withGeo.dim_w as number},
      dim_h = ${withGeo.dim_h as number},
      cost = ${withGeo.cost as number},
      eta = ${withGeo.eta as string | null},
      progress = ${withGeo.progress as number},
      mode = ${withGeo.mode as string},
      priority = ${withGeo.priority as string},
      shipper = ${withGeo.shipper as string},
      consignee = ${withGeo.consignee as string},
      documents = ${withGeo.documents as string[]},
      tags = ${withGeo.tags as string[]},
      customer_email = ${withGeo.customer_email as string | null},
      notes = ${withGeo.notes as string | null},
      origin_lat = ${asNullableNumber(withGeo.origin_lat)},
      origin_lng = ${asNullableNumber(withGeo.origin_lng)},
      destination_lat = ${asNullableNumber(withGeo.destination_lat)},
      destination_lng = ${asNullableNumber(withGeo.destination_lng)},
      current_lat = ${asNullableNumber(withGeo.current_lat)},
      current_lng = ${asNullableNumber(withGeo.current_lng)},
      current_location_updated_at = ${
        withGeo.current_location_updated_at
          ? new Date(withGeo.current_location_updated_at as string)
          : null
      }
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
