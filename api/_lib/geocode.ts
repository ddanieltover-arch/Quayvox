import { lookupPortCoords, type GeoCoord } from './geoPorts';

const cache = new Map<string, GeoCoord | null>();
let lastRemoteAt = 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttleRemote() {
  const elapsed = Date.now() - lastRemoteAt;
  if (elapsed < 1100) {
    await sleep(1100 - elapsed);
  }
  lastRemoteAt = Date.now();
}

/** Parse pasted coordinates like "34.0522, -118.2437". */
export function parseCoordPair(input: string): GeoCoord | null {
  const trimmed = input.trim();
  const match = trimmed.match(
    /^(-?\d{1,2}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)$/
  );
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return [lat, lng];
}

async function geocodeWithNominatim(address: string): Promise<GeoCoord | null> {
  await throttleRemote();

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', address);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'QuayvoxLogistics/1.0 (shipment-tracking; https://quayvox.com)',
    },
  });

  if (!res.ok) {
    console.warn('geocode nominatim failed', res.status, address);
    return null;
  }

  const data = (await res.json()) as Array<{ lat?: string; lon?: string }>;
  const hit = data[0];
  if (!hit?.lat || !hit?.lon) return null;

  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

async function geocodeWithPhoton(address: string): Promise<GeoCoord | null> {
  await throttleRemote();

  const url = new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q', address);
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    console.warn('geocode photon failed', res.status, address);
    return null;
  }

  const data = (await res.json()) as {
    features?: Array<{ geometry?: { coordinates?: number[] } }>;
  };
  const coords = data.features?.[0]?.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;

  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return [lat, lng];
}

/** Resolve an address or place name to coordinates. */
export async function geocodeAddress(address: string): Promise<GeoCoord | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const key = trimmed.toLowerCase();
  if (cache.has(key)) return cache.get(key) ?? null;

  const port = lookupPortCoords(trimmed);
  if (port) {
    cache.set(key, port);
    return port;
  }

  const parsed = parseCoordPair(trimmed);
  if (parsed) {
    cache.set(key, parsed);
    return parsed;
  }

  try {
    let remote = await geocodeWithNominatim(trimmed);
    if (!remote) {
      remote = await geocodeWithPhoton(trimmed);
    }
    cache.set(key, remote);
    return remote;
  } catch (err) {
    console.warn('geocode error', err);
    try {
      const fallback = await geocodeWithPhoton(trimmed);
      cache.set(key, fallback);
      return fallback;
    } catch (fallbackErr) {
      console.warn('geocode fallback error', fallbackErr);
      cache.set(key, null);
      return null;
    }
  }
}

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

function needsGeoEnrichment(row: Record<string, unknown>): boolean {
  const originText =
    asNullableString(row.sender_address) || asNullableString(row.origin) || '';
  const destinationText =
    asNullableString(row.receiver_address) || asNullableString(row.destination) || '';
  const currentText = asNullableString(row.current_address);

  const missingOrigin =
    Boolean(originText) &&
    (asNullableNumber(row.origin_lat) == null || asNullableNumber(row.origin_lng) == null);
  const missingDestination =
    Boolean(destinationText) &&
    (asNullableNumber(row.destination_lat) == null ||
      asNullableNumber(row.destination_lng) == null);
  const missingCurrent =
    Boolean(currentText) &&
    (asNullableNumber(row.current_lat) == null || asNullableNumber(row.current_lng) == null);

  return missingOrigin || missingDestination || missingCurrent;
}

/**
 * Fill missing origin/destination/current coordinates from addresses.
 * When `forceCurrent` is true, re-geocode current_address even if coords exist.
 */
export async function enrichShipmentGeo(
  payload: Record<string, unknown>,
  options?: { forceCurrent?: boolean }
): Promise<Record<string, unknown>> {
  const next = { ...payload };

  const originText =
    asNullableString(next.sender_address) || asNullableString(next.origin) || '';
  const destinationText =
    asNullableString(next.receiver_address) || asNullableString(next.destination) || '';
  const currentText = asNullableString(next.current_address);

  if (asNullableNumber(next.origin_lat) == null || asNullableNumber(next.origin_lng) == null) {
    if (originText) {
      const coords = await geocodeAddress(originText);
      if (coords) {
        next.origin_lat = coords[0];
        next.origin_lng = coords[1];
      }
    }
  }

  if (
    asNullableNumber(next.destination_lat) == null ||
    asNullableNumber(next.destination_lng) == null
  ) {
    if (destinationText) {
      const coords = await geocodeAddress(destinationText);
      if (coords) {
        next.destination_lat = coords[0];
        next.destination_lng = coords[1];
      }
    }
  }

  if (!currentText) {
    if (Object.prototype.hasOwnProperty.call(payload, 'current_address')) {
      next.current_lat = null;
      next.current_lng = null;
    }
    return next;
  }

  const shouldGeocodeCurrent =
    options?.forceCurrent ||
    asNullableNumber(next.current_lat) == null ||
    asNullableNumber(next.current_lng) == null;

  if (shouldGeocodeCurrent) {
    const coords = await geocodeAddress(currentText);
    if (coords) {
      next.current_lat = coords[0];
      next.current_lng = coords[1];
    }
  }

  return next;
}

export { needsGeoEnrichment };
