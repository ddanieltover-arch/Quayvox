import { getSql } from './db';
import { lookupPortCoords } from './geoPorts';
import { enrichShipmentGeo, geocodeAddress, needsGeoEnrichment } from './geocode';

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
  'item_name',
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

/** Copy a Neon/pg row by named columns so array-index spreads cannot drop emails. */
function plainShipmentRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
  for (const key of UPDATE_COLUMNS) {
    out[key] = row[key];
  }
  return out;
}

function patchedOrExisting(
  patch: Record<string, unknown>,
  existing: Record<string, unknown>,
  key: string
): unknown {
  return Object.prototype.hasOwnProperty.call(patch, key) ? patch[key] : existing[key];
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
  const rows = await sql`select * from public.shipments order by created_at desc`;
  const enriched: Record<string, unknown>[] = [];
  let backfilled = 0;

  for (const row of rows as Record<string, unknown>[]) {
    // Backfill at most one shipment per list request to stay within serverless limits.
    if (backfilled < 1 && needsGeoEnrichment(row)) {
      enriched.push(await persistMissingShipmentGeo(row));
      backfilled += 1;
    } else {
      enriched.push(row);
    }
  }

  return enriched;
}

/** Geocode missing address fields and persist lat/lng without triggering notifications. */
export async function persistMissingShipmentGeo(
  row: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (!needsGeoEnrichment(row)) return row;

  const enriched = await enrichShipmentGeo(row);
  const id = String(row.id);

  const originLat = asNullableNumber(enriched.origin_lat);
  const originLng = asNullableNumber(enriched.origin_lng);
  const destinationLat = asNullableNumber(enriched.destination_lat);
  const destinationLng = asNullableNumber(enriched.destination_lng);
  const currentLat = asNullableNumber(enriched.current_lat);
  const currentLng = asNullableNumber(enriched.current_lng);

  const changed =
    originLat !== asNullableNumber(row.origin_lat) ||
    originLng !== asNullableNumber(row.origin_lng) ||
    destinationLat !== asNullableNumber(row.destination_lat) ||
    destinationLng !== asNullableNumber(row.destination_lng) ||
    currentLat !== asNullableNumber(row.current_lat) ||
    currentLng !== asNullableNumber(row.current_lng);

  if (!changed) return row;

  const currentUpdated =
    currentLat != null &&
    currentLng != null &&
    (currentLat !== asNullableNumber(row.current_lat) ||
      currentLng !== asNullableNumber(row.current_lng));

  const sql = getSql();
  const updated = await sql`
    update public.shipments set
      origin_lat = ${originLat},
      origin_lng = ${originLng},
      destination_lat = ${destinationLat},
      destination_lng = ${destinationLng},
      current_lat = ${currentLat},
      current_lng = ${currentLng},
      current_location_updated_at = ${
        currentUpdated
          ? new Date()
          : row.current_location_updated_at
            ? new Date(String(row.current_location_updated_at))
            : null
      }
    where id = ${id}
    returning *
  `;

  const next = (updated[0] as Record<string, unknown> | undefined) ?? {
    ...row,
    origin_lat: originLat,
    origin_lng: originLng,
    destination_lat: destinationLat,
    destination_lng: destinationLng,
    current_lat: currentLat,
    current_lng: currentLng,
  };

  if (
    currentUpdated &&
    currentLat != null &&
    currentLng != null &&
    asNullableString(row.current_address)
  ) {
    await recordShipmentTrailPoint({
      shipment_id: id,
      lat: currentLat,
      lng: currentLng,
      label: asNullableString(row.current_address),
    });
  }

  return next;
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
  const row = (rows[0] as Record<string, unknown> | undefined) ?? null;
  if (!row) return null;
  return persistMissingShipmentGeo(row);
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

export async function listShipmentPositions(shipmentId: string, limit = 200) {
  const sql = getSql();
  const capped = Math.min(Math.max(limit, 1), 200);
  return sql`
    select * from public.shipment_positions
    where shipment_id = ${shipmentId}
    order by recorded_at desc
    limit ${capped}
  `;
}

function coordsNear(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): boolean {
  return Math.abs(aLat - bLat) < 0.00015 && Math.abs(aLng - bLng) < 0.00015;
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

/** Keep every distinct stop on the trail; skip an immediate duplicate of the last pin. */
export async function recordShipmentTrailPoint(input: {
  shipment_id: string;
  lat: number;
  lng: number;
  label?: string | null;
}) {
  if (!Number.isFinite(input.lat) || !Number.isFinite(input.lng)) return null;
  const sql = getSql();
  const lastRows = await sql`
    select lat, lng from public.shipment_positions
    where shipment_id = ${input.shipment_id}
    order by recorded_at desc
    limit 1
  `;
  const last = lastRows[0] as { lat: number; lng: number } | undefined;
  if (
    last &&
    coordsNear(Number(last.lat), Number(last.lng), input.lat, input.lng)
  ) {
    return last;
  }
  return insertShipmentPosition(input);
}

export async function recordShipmentLocationChange(
  shipmentId: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>
) {
  const beforeLat = asNullableNumber(before.current_lat);
  const beforeLng = asNullableNumber(before.current_lng);
  const afterLat = asNullableNumber(after.current_lat);
  const afterLng = asNullableNumber(after.current_lng);
  const beforeValid = beforeLat != null && beforeLng != null;
  const afterValid = afterLat != null && afterLng != null;
  const coordsChanged =
    afterValid && (!beforeValid || !coordsNear(beforeLat, beforeLng, afterLat, afterLng));
  const addressChanged =
    String(before.current_address ?? '').trim() !== String(after.current_address ?? '').trim();

  if (!coordsChanged && !addressChanged && beforeValid) return;

  if (beforeValid && (coordsChanged || addressChanged)) {
    await recordShipmentTrailPoint({
      shipment_id: shipmentId,
      lat: beforeLat,
      lng: beforeLng,
      label: asNullableString(before.current_address),
    });
  }

  if (afterValid) {
    await recordShipmentTrailPoint({
      shipment_id: shipmentId,
      lat: afterLat,
      lng: afterLng,
      label: asNullableString(after.current_address),
    });
  }
}

export async function insertShipment(payload: Record<string, unknown>) {
  const sql = getSql();
  const resolved = await enrichShipmentGeo(resolveGeoDefaults(payload), { forceCurrent: true });
  const senderName = asString(resolved.sender_name ?? resolved.shipper);
  const receiverName = asString(resolved.receiver_name ?? resolved.consignee);
  const receiverEmail = asNullableString(resolved.receiver_email ?? resolved.customer_email);
  const senderAddress = asString(resolved.sender_address ?? resolved.origin);
  const receiverAddress = asString(resolved.receiver_address ?? resolved.destination);
  const rows = await sql`
    insert into public.shipments (
      tracking_number, origin, destination, carrier, status, weight,
      dim_l, dim_w, dim_h, cost, eta, progress, mode, priority,
      shipper, consignee, documents, tags, customer_email, notes, item_name,
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
      ${asString(resolved.item_name)},
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
  const existingRaw = (await getShipmentById(id)) as Record<string, unknown> | null;
  if (!existingRaw) return null;

  const existing = plainShipmentRow(existingRaw);
  const merged: Record<string, unknown> = { ...existing };
  for (const [key, value] of Object.entries(patch)) {
    if (UPDATE_COLUMNS.has(key)) merged[key] = value;
  }

  const addressInPatch = Object.prototype.hasOwnProperty.call(patch, 'current_address');
  const previousAddress = asNullableString(existing.current_address);
  const nextAddress = addressInPatch
    ? asNullableString(patch.current_address)
    : previousAddress;
  const addressTextChanged = addressInPatch && previousAddress !== nextAddress;

  const withGeo = await enrichShipmentGeo(resolveGeoDefaults(merged), {
    forceCurrent: addressTextChanged,
  });

  const currentChanged =
    Object.prototype.hasOwnProperty.call(patch, 'current_lat') ||
    Object.prototype.hasOwnProperty.call(patch, 'current_lng') ||
    (addressInPatch &&
      asNullableNumber(withGeo.current_lat) != null &&
      asNullableNumber(withGeo.current_lng) != null &&
      (addressTextChanged ||
        asNullableNumber(existing.current_lat) == null ||
        asNullableNumber(existing.current_lng) == null));
  const addressChanged = addressInPatch;
  if (currentChanged && asNullableNumber(withGeo.current_lat) != null && asNullableNumber(withGeo.current_lng) != null) {
    withGeo.current_location_updated_at = new Date().toISOString();
  } else if (addressChanged && asNullableString(withGeo.current_address)) {
    withGeo.current_location_updated_at = new Date().toISOString();
  }

  const senderName = asString(withGeo.sender_name ?? withGeo.shipper);
  const receiverName = asString(withGeo.receiver_name ?? withGeo.consignee);
  const senderEmail = asNullableString(patchedOrExisting(patch, existing, 'sender_email'));
  const receiverEmail = asNullableString(
    patchedOrExisting(patch, existing, 'receiver_email') ??
      patchedOrExisting(patch, existing, 'customer_email')
  );
  const customerEmail = asNullableString(
    patchedOrExisting(patch, existing, 'customer_email') ?? receiverEmail
  );
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
      customer_email = ${customerEmail},
      notes = ${asNullableString(withGeo.notes)},
      item_name = ${asString(withGeo.item_name)},
      sender_name = ${senderName},
      sender_phone = ${asString(withGeo.sender_phone)},
      sender_email = ${senderEmail},
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
  const location = input.location?.trim();
  if (location) {
    const coords = await geocodeAddress(location);
    if (coords) {
      await recordShipmentTrailPoint({
        shipment_id: input.shipment_id,
        lat: coords[0],
        lng: coords[1],
        label: location,
      });
    }
  }
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
