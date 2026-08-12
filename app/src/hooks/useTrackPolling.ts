import { useCallback, useEffect, useRef, useState } from 'react';
import {
  mapEventRow,
  mapPositionRow,
  mapShipmentRow,
  type ShipmentEvent,
  type ShipmentEventRow,
  type ShipmentPosition,
  type ShipmentPositionRow,
  type ShipmentRow,
  type ShipmentWithExtras,
} from '@/lib/shipments';

const DEFAULT_INTERVAL_MS = 8000;

export interface TrackPollResult {
  shipment: ShipmentWithExtras | null;
  events: ShipmentEvent[];
  positions: ShipmentPosition[];
  loading: boolean;
  notFound: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  refresh: () => void;
}

export function useTrackPolling(
  trackingNumber: string,
  options?: { intervalMs?: number; enabled?: boolean }
): TrackPollResult {
  const intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL_MS;
  const enabled = options?.enabled ?? true;
  const [shipment, setShipment] = useState<ShipmentWithExtras | null>(null);
  const [events, setEvents] = useState<ShipmentEvent[]>([]);
  const [positions, setPositions] = useState<ShipmentPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) return;

    const code = trackingNumber.trim();
    if (!code) {
      setLoading(false);
      setNotFound(false);
      setShipment(null);
      setEvents([]);
      setPositions([]);
      setError(null);
      return;
    }

    let cancelled = false;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    async function load(isInitial: boolean) {
      if (isInitial) setLoading(true);

      try {
        const res = await fetch(`/api/track/${encodeURIComponent(code)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as {
          shipment?: ShipmentRow | null;
          events?: ShipmentEventRow[];
          positions?: ShipmentPositionRow[];
          error?: string;
        };

        if (cancelled) return;

        if (res.status === 503) {
          setError('Tracking is unavailable until the database API is running.');
          setShipment(null);
          setEvents([]);
          setPositions([]);
          setNotFound(false);
          setLoading(false);
          return;
        }

        if (res.status === 404 || !data.shipment) {
          setShipment(null);
          setEvents([]);
          setPositions([]);
          setNotFound(true);
          setError(null);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setError(data.error || 'Failed to load tracking data');
          setShipment(null);
          setEvents([]);
          setPositions([]);
          setLoading(false);
          return;
        }

        setShipment(mapShipmentRow(data.shipment));
        setEvents((data.events ?? []).map(mapEventRow));
        setPositions((data.positions ?? []).map(mapPositionRow));
        setError(null);
        setNotFound(false);
        setLastFetchedAt(Date.now());
        setLoading(false);
      } catch (err) {
        if (cancelled || (err as Error).name === 'AbortError') return;
        setError('Cannot reach tracking API. Run `vercel dev` from the repo root.');
        setShipment(null);
        setEvents([]);
        setPositions([]);
        setLoading(false);
      }
    }

    void load(true);

    const onVisibility = () => {
      if (!document.hidden) void load(false);
    };

    const id = window.setInterval(() => {
      if (!document.hidden) void load(false);
    }, intervalMs);

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [trackingNumber, intervalMs, enabled, tick]);

  return {
    shipment,
    events,
    positions,
    loading,
    notFound,
    error,
    lastFetchedAt,
    refresh,
  };
}
