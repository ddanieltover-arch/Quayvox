export type SnappedRoute = {
  coordinates: [number, number][];
  durationSec: number | null;
  distanceM: number | null;
};

const memoryCache = new Map<string, SnappedRoute | null>();
const inflight = new Map<string, Promise<SnappedRoute | null>>();

function roundKey(points: Array<[number, number]>): string {
  return points.map(([lat, lng]) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join(';');
}

export async function fetchSnappedRoute(
  points: Array<[number, number]>
): Promise<SnappedRoute | null> {
  if (points.length < 2) return null;
  const key = roundKey(points);
  if (memoryCache.has(key)) return memoryCache.get(key) ?? null;

  const existing = inflight.get(key);
  if (existing) return existing;

  const request = (async () => {
    try {
      const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(';');
      const res = await fetch(`/api/route?coords=${encodeURIComponent(coords)}`);
      if (!res.ok) {
        memoryCache.set(key, null);
        return null;
      }
      const data = (await res.json()) as SnappedRoute;
      if (!Array.isArray(data.coordinates) || data.coordinates.length < 2) {
        memoryCache.set(key, null);
        return null;
      }
      memoryCache.set(key, data);
      return data;
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

export function formatRouteDuration(durationSec: number | null | undefined): string | null {
  if (durationSec == null || !Number.isFinite(durationSec) || durationSec <= 0) return null;
  const minutes = Math.max(1, Math.round(durationSec / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}
