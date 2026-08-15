import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions } from '../http';

const MAX_WAYPOINTS = 25;
const MAX_HOP_KM = 5000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

type CacheEntry = {
  expiresAt: number;
  body: {
    coordinates: [number, number][];
    durationSec: number | null;
    distanceM: number | null;
  };
};

const cache = new Map<string, CacheEntry>();

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function parseCoords(raw: string): Array<{ lat: number; lng: number }> | null {
  const parts = raw.split(';').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2 || parts.length > MAX_WAYPOINTS) return null;
  const points: Array<{ lat: number; lng: number }> = [];
  for (const part of parts) {
    const [lngRaw, latRaw] = part.split(',');
    const lng = Number(lngRaw);
    const lat = Number(latRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    points.push({ lat, lng });
  }
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    if (haversineKm(prev.lat, prev.lng, next.lat, next.lng) > MAX_HOP_KM) return null;
  }
  return points;
}

function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
  while (cache.size > 80) {
    const first = cache.keys().next().value;
    if (first == null) break;
    cache.delete(first);
  }
}

export async function handleRoute(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handleOptions(req, res, 'GET, OPTIONS')) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const raw = typeof req.query.coords === 'string' ? req.query.coords : '';
  const points = parseCoords(raw);
  if (!points) {
    res.status(400).json({ error: 'Invalid coords (lng,lat;lng,lat…)' });
    return;
  }

  const cacheKey = points.map((p) => `${p.lng.toFixed(5)},${p.lat.toFixed(5)}`).join(';');
  pruneCache();
  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) {
    res.status(200).json(hit.body);
    return;
  }

  const osrmBase = (process.env.OSRM_URL || 'https://router.project-osrm.org').replace(/\/$/, '');
  const path = points.map((p) => `${p.lng},${p.lat}`).join(';');
  const url = `${osrmBase}/route/v1/driving/${path}?overview=full&geometries=geojson`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (response.status === 429) {
      res.status(429).json({ error: 'Router busy' });
      return;
    }
    if (!response.ok) {
      res.status(502).json({ error: 'Router failed' });
      return;
    }
    const data = (await response.json()) as {
      code?: string;
      routes?: Array<{
        distance?: number;
        duration?: number;
        geometry?: { coordinates?: [number, number][] };
      }>;
    };
    const route = data.routes?.[0];
    const geometry = route?.geometry?.coordinates;
    if (data.code !== 'Ok' || !geometry?.length) {
      res.status(404).json({ error: 'No route' });
      return;
    }

    const body = {
      coordinates: geometry.map(([lng, lat]) => [lat, lng] as [number, number]),
      durationSec: typeof route.duration === 'number' ? route.duration : null,
      distanceM: typeof route.distance === 'number' ? route.distance : null,
    };
    cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, body });
    res.status(200).json(body);
  } catch (err) {
    console.error('route', err);
    res.status(504).json({ error: 'Router timeout' });
  } finally {
    clearTimeout(timer);
  }
}
