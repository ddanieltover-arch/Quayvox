import type { GeoCoord } from '@/lib/geoPorts';

const memoryCache = new Map<string, GeoCoord | null>();
const inflight = new Map<string, Promise<GeoCoord | null>>();

/** Resolve an address to coordinates via the Quayvox geocode API. */
export async function geocodeAddressClient(address: string): Promise<GeoCoord | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const key = trimmed.toLowerCase();
  if (memoryCache.has(key)) return memoryCache.get(key) ?? null;

  const existing = inflight.get(key);
  if (existing) return existing;

  const request = (async () => {
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        memoryCache.set(key, null);
        return null;
      }
      const data = (await res.json()) as { lat?: number | null; lng?: number | null; found?: boolean };
      if (!data.found || data.lat == null || data.lng == null) {
        memoryCache.set(key, null);
        return null;
      }
      const coords: GeoCoord = [Number(data.lat), Number(data.lng)];
      if (!Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) {
        memoryCache.set(key, null);
        return null;
      }
      memoryCache.set(key, coords);
      return coords;
    } catch {
      memoryCache.set(key, null);
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, request);
  return request;
}
