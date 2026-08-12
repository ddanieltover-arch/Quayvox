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
  'sender_name',
  'sender_phone',
  'sender_email',
  'sender_street',
  'sender_city',
  'sender_state',
  'sender_postal',
  'sender_country',
  'sender_address',
  'receiver_name',
  'receiver_phone',
  'receiver_email',
  'receiver_street',
  'receiver_city',
  'receiver_state',
  'receiver_postal',
  'receiver_country',
  'receiver_address',
  'current_address',
  'departure_at',
  'delivery_at',
  'volume',
  'payment_method',
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

function asNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

function asString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function asNullableDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
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
  const senderName = asString(resolved.sender_name ?? resolved.shipper);
  const receiverName = asString(resolved.receiver_name ?? resolved.consignee);
  const receiverEmail = asNullableString(resolved.receiver_email ?? resolved.customer_email);
  const senderAddress = asString(resolved.sender_address ?? resolved.origin);
  const receiverAddress = asString(resolved.receiver_address ?? resolved.destination);
  const rows = await sql`
    insert into public.shipments (
      tracking_number, origin, destination, carrier, status, weight,
      dim_l, dim_w, dim_h, cost, eta, progress, mode, priority,
      shipper, consignee, documents, tags, customer_email, notes,
      sender_name, sender_phone, sender_email, sender_address,
      sender_street, sender_city, sender_state, sender_postal, sender_country,
      receiver_name, receiver_phone, receiver_email, receiver_address,
      receiver_street, receiver_city, receiver_state, receiver_postal, receiver_country,
      departure_at, delivery_at, volume, payment_method, current_address,
      origin_lat, origin_lng, destination_lat, destination_lng,
      current_lat, current_lng, current_location_updated_at
    ) values (
      ${resolved.tracking_number as string},
      ${senderAddress},
      ${receiverAddress},
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
      ${senderName},
      ${receiverName},
      ${resolved.documents as string[]},
      ${resolved.tags as string[]},
      ${receiverEmail},
      ${asNullableString(resolved.notes)},
      ${senderName},
      ${asString(resolved.sender_phone)},
      ${asNullableString(resolved.sender_email)},
      ${senderAddress},
      ${''},
      ${''},
      ${null},
      ${null},
      ${''},
      ${receiverName},
      ${asString(resolved.receiver_phone)},
      ${receiverEmail},
      ${receiverAddress},
      ${''},
      ${''},
      ${null},
      ${null},
      ${''},
      ${asNullableDate(resolved.departure_at)},
      ${asNullableDate(resolved.delivery_at)},
      ${Number(resolved.volume ?? 0)},
      ${asString(resolved.payment_method)},
      ${asNullableString(resolved.current_address)},
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
  const addressChanged = Object.prototype.hasOwnProperty.call(patch, 'current_address');
  if (currentChanged && asNullableNumber(withGeo.current_lat) != null && asNullableNumber(withGeo.current_lng) != null) {
    withGeo.current_location_updated_at = new Date().toISOString();
  } else if (addressChanged && asNullableString(withGeo.current_address)) {
    withGeo.current_location_updated_at = new Date().toISOString();
  }

  const senderName = asString(withGeo.sender_name ?? withGeo.shipper);
  const receiverName = asString(withGeo.receiver_name ?? withGeo.consignee);
  const receiverEmail = asNullableString(withGeo.receiver_email ?? withGeo.customer_email);
  const senderAddress = asString(withGeo.sender_address ?? withGeo.origin);
  const receiverAddress = asString(withGeo.receiver_address ?? withGeo.destination);

  const sql = getSql();
  const rows = await sql`
    update public.shipments set
      tracking_number = ${withGeo.tracking_number as string},
      origin = ${senderAddress},
      destination = ${receiverAddress},
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
      shipper = ${senderName},
      consignee = ${receiverName},
      documents = ${withGeo.documents as string[]},
      tags = ${withGeo.tags as string[]},
      customer_email = ${receiverEmail},
      notes = ${asNullableString(withGeo.notes)},
      sender_name = ${senderName},
      sender_phone = ${asString(withGeo.sender_phone)},
      sender_email = ${asNullableString(withGeo.sender_email)},
      sender_address = ${senderAddress},
      sender_street = ${''},
      sender_city = ${''},
      sender_state = ${null},
      sender_postal = ${null},
      sender_country = ${''},
      receiver_name = ${receiverName},
      receiver_phone = ${asString(withGeo.receiver_phone)},
      receiver_email = ${receiverEmail},
      receiver_address = ${receiverAddress},
      receiver_street = ${''},
      receiver_city = ${''},
      receiver_state = ${null},
      receiver_postal = ${null},
      receiver_country = ${''},
      departure_at = ${asNullableDate(withGeo.departure_at)},
      delivery_at = ${asNullableDate(withGeo.delivery_at)},
      volume = ${Number(withGeo.volume ?? 0)},
      payment_method = ${asString(withGeo.payment_method)},
      current_address = ${asNullableString(withGeo.current_address)},
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
