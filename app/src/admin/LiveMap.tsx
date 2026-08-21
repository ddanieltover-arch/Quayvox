import { useEffect, useMemo, useState } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';
import { getStatusColor } from '@/data/mockShipments';
import {
  ShipmentMap,
  resolveDisplayPosition,
  type MapShipmentGeo,
} from '@/components/tracking/ShipmentMap';
import { MapErrorBoundary } from '@/components/tracking/MapErrorBoundary';
import { MapLayersControl, useMapLayerPrefs } from '@/components/tracking/MapTypeSheet';
import {
  mapPositionRow,
  mapEventRow,
  mapStopsFromEvents,
  type ShipmentEventRow,
  type ShipmentPosition,
  type ShipmentPositionRow,
} from '@/lib/shipments';

function latestHoldAlertMessage(
  status: string,
  notes?: string | null,
  stops?: Array<{ status?: string | null; message?: string | null }>,
  fetched?: string | null
): string | undefined {
  if (status !== 'On Hold') return undefined;
  const fromStops = [...(stops ?? [])]
    .reverse()
    .find((stop) => stop.message?.trim() && (stop.status === 'On Hold' || Boolean(stop.message?.trim())));
  return fromStops?.message?.trim() || fetched?.trim() || notes?.trim() || undefined;
}

const LiveMap = () => {
  const { shipments, refreshShipments, loading } = useShipments();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {
    mapType,
    setMapType,
    satelliteLabels,
    setSatelliteLabels,
    showPorts,
    setShowPorts,
    layersOpen,
    setLayersOpen,
  } = useMapLayerPrefs(true);
  const [positions, setPositions] = useState<ShipmentPosition[]>([]);
  const [eventStops, setEventStops] = useState<ReturnType<typeof mapStopsFromEvents>>([]);
  const [lastPoll, setLastPoll] = useState<number | null>(null);
  const [holdAlerts, setHoldAlerts] = useState<Record<string, string>>({});

  const activeShipments = useMemo(
    () =>
      shipments.filter((s) =>
        ['Pending', 'In Transit', 'Customs', 'On Hold', 'Exception'].includes(s.status)
      ),
    [shipments]
  );

  useEffect(() => {
    if (!selectedId && activeShipments[0]) {
      setSelectedId(activeShipments[0].id);
    }
  }, [activeShipments, selectedId]);

  useEffect(() => {
    const poll = () => {
      if (!document.hidden) {
        void refreshShipments().then(() => setLastPoll(Date.now()));
      }
    };
    poll();
    const id = window.setInterval(poll, 8000);
    const onVis = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [refreshShipments]);

  useEffect(() => {
    const selected = shipments.find((s) => s.id === selectedId);
    if (!selected) {
      setPositions([]);
      setEventStops([]);
      return;
    }

    let cancelled = false;
    async function loadTrail() {
      try {
        const res = await fetch(
          `/api/track/${encodeURIComponent(selected!.trackingNumber)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          positions?: ShipmentPositionRow[];
          events?: ShipmentEventRow[];
        };
        if (!cancelled) {
          setPositions((data.positions ?? []).map(mapPositionRow));
          setEventStops(mapStopsFromEvents((data.events ?? []).map(mapEventRow)));
        }
      } catch {
        if (!cancelled) {
          setPositions([]);
          setEventStops([]);
        }
      }
    }
    void loadTrail();
    const id = window.setInterval(() => {
      if (!document.hidden) void loadTrail();
    }, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [selectedId, shipments]);

  useEffect(() => {
    const held = activeShipments.filter((s) => s.status === 'On Hold');
    if (held.length === 0) {
      setHoldAlerts({});
      return;
    }

    let cancelled = false;
    void Promise.all(
      held.map(async (s) => {
        try {
          const res = await fetch(`/api/track/${encodeURIComponent(s.trackingNumber)}`);
          if (!res.ok) return [s.id, ''] as const;
          const data = (await res.json()) as { events?: ShipmentEventRow[] };
          const events = (data.events ?? []).map(mapEventRow);
          const holdEvent = [...events]
            .reverse()
            .find((event) => event.status === 'On Hold' && event.message?.trim());
          const latest = holdEvent ?? [...events].reverse().find((event) => event.message?.trim());
          return [s.id, latest?.message?.trim() || ''] as const;
        } catch {
          return [s.id, ''] as const;
        }
      })
    ).then((entries) => {
      if (cancelled) return;
      const next: Record<string, string> = {};
      for (const [id, message] of entries) {
        if (message) next[id] = message;
      }
      setHoldAlerts(next);
    });

    return () => {
      cancelled = true;
    };
  }, [activeShipments]);

  const mapShipments: MapShipmentGeo[] = useMemo(
    () =>
      activeShipments.map((s) => ({
        id: s.id,
        trackingNumber: s.trackingNumber,
        status: s.status,
        progress: s.progress,
        origin: s.origin,
        destination: s.destination,
        originLat: s.originLat,
        originLng: s.originLng,
        destinationLat: s.destinationLat,
        destinationLng: s.destinationLng,
        currentLat: s.currentLat,
        currentLng: s.currentLng,
        currentAddress: s.currentAddress,
        mode: s.mode,
        itemName: s.itemName,
        alertMessage: latestHoldAlertMessage(
          s.status,
          s.notes,
          s.id === selectedId ? eventStops : undefined,
          holdAlerts[s.id]
        ),
        positions: s.id === selectedId ? positions : undefined,
        stops: s.id === selectedId ? eventStops : undefined,
      })),
    [activeShipments, positions, eventStops, selectedId, holdAlerts]
  );

  const selected = activeShipments.find((s) => s.id === selectedId) ?? null;
  const displayPos = selected ? resolveDisplayPosition(selected) : null;

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col min-h-[480px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Live Map</h1>
          <p className="text-sm text-text-secondary mt-1">
            Admin-updated positions · refreshes about every 8s
            {lastPoll ? ` · last ${new Date(lastPoll).toLocaleTimeString()}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refreshShipments()}
            className="btn-secondary flex items-center gap-2 text-sm min-h-11"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 min-h-0">
        <aside className="card-surface p-3 overflow-y-auto max-h-[240px] lg:max-h-none">
          <p className="text-xs font-mono uppercase text-text-secondary mb-2 px-1">
            Active ({activeShipments.length})
          </p>
          <ul className="space-y-1">
            {activeShipments.map((s) => {
              const pos = resolveDisplayPosition(s);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                    className={`w-full text-left rounded-xl px-3 py-2.5 transition-colors ${
                      selectedId === s.id ? 'bg-cobalt/15 border border-cobalt/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm text-cobalt">{s.trackingNumber}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(s.status)} ${
                          s.status === 'On Hold' ? 'animate-pulse' : ''
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1 truncate">
                      {s.origin} → {s.destination}
                    </p>
                    <p className="text-[11px] text-text-secondary mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {s.currentLocationUpdatedAt
                        ? `Updated ${new Date(s.currentLocationUpdatedAt).toLocaleString()}`
                        : s.currentLat != null && s.currentLng != null
                          ? 'Pinned location'
                          : pos
                            ? 'Estimated from progress'
                            : s.origin || s.destination || s.currentAddress
                              ? 'Locating address…'
                              : 'No coordinates yet'}
                    </p>
                  </button>
                </li>
              );
            })}
            {activeShipments.length === 0 && (
              <li className="text-sm text-text-secondary px-2 py-4">No active shipments.</li>
            )}
          </ul>
        </aside>

        <div className="relative min-h-[320px] flex flex-col gap-3">
          <div className="relative flex-1 min-h-[320px]">
            <MapErrorBoundary resetKey={`${mapType}-${satelliteLabels}`}>
              <ShipmentMap
                key={mapType}
                shipments={mapShipments}
                selectedId={selectedId}
                onSelect={setSelectedId}
                showPorts={showPorts}
                basemap={mapType}
                satelliteLabels={satelliteLabels}
                className="h-[min(60vh,520px)] min-h-[320px]"
              />
            </MapErrorBoundary>
            <MapLayersControl
              mapType={mapType}
              onMapTypeChange={setMapType}
              satelliteLabels={satelliteLabels}
              onSatelliteLabelsChange={setSatelliteLabels}
              showPorts={showPorts}
              onShowPortsChange={setShowPorts}
              layersOpen={layersOpen}
              onLayersOpenChange={setLayersOpen}
            />
          </div>
          {selected && (
            <div className="card-surface p-4 flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-xs text-text-secondary">Selected</p>
                <p className="font-mono text-cobalt">{selected.trackingNumber}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Position</p>
                <p className="text-text-primary">
                  {displayPos
                    ? `${displayPos[0].toFixed(4)}, ${displayPos[1].toFixed(4)}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Progress</p>
                <p className="text-text-primary">{selected.progress}%</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Trail points</p>
                <p className="text-text-primary">{positions.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
