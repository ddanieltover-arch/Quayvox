import { useEffect, useMemo, useState } from 'react';
import { Layers, MapPin, RefreshCw } from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';
import { getStatusColor } from '@/data/mockShipments';
import {
  ShipmentMap,
  resolveDisplayPosition,
  type MapShipmentGeo,
} from '@/components/tracking/ShipmentMap';
import { MapTypeSheet } from '@/components/tracking/MapTypeSheet';
import { isMapBasemapId, type MapBasemapId } from '@/lib/mapConfig';
import {
  mapPositionRow,
  mapEventRow,
  mapStopsFromEvents,
  type ShipmentEventRow,
  type ShipmentPosition,
  type ShipmentPositionRow,
} from '@/lib/shipments';

const MAP_TYPE_KEY = 'qv-live-map-type';
const MAP_LABELS_KEY = 'qv-live-map-labels';
const MAP_PORTS_KEY = 'qv-live-map-ports';

function readStoredBasemap(): MapBasemapId {
  try {
    const value = localStorage.getItem(MAP_TYPE_KEY);
    return isMapBasemapId(value) ? value : 'default';
  } catch {
    return 'default';
  }
}

function readStoredFlag(key: string, fallback: boolean): boolean {
  try {
    const value = localStorage.getItem(key);
    if (value === '1') return true;
    if (value === '0') return false;
    return fallback;
  } catch {
    return fallback;
  }
}

const LiveMap = () => {
  const { shipments, refreshShipments, loading } = useShipments();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapType, setMapType] = useState<MapBasemapId>(readStoredBasemap);
  const [satelliteLabels, setSatelliteLabels] = useState(() => readStoredFlag(MAP_LABELS_KEY, false));
  const [showPorts, setShowPorts] = useState(() => readStoredFlag(MAP_PORTS_KEY, true));
  const [layersOpen, setLayersOpen] = useState(false);
  const [positions, setPositions] = useState<ShipmentPosition[]>([]);
  const [eventStops, setEventStops] = useState<{ label: string }[]>([]);
  const [lastPoll, setLastPoll] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(MAP_TYPE_KEY, mapType);
      localStorage.setItem(MAP_LABELS_KEY, satelliteLabels ? '1' : '0');
      localStorage.setItem(MAP_PORTS_KEY, showPorts ? '1' : '0');
    } catch {
      /* ignore quota / private mode */
    }
  }, [mapType, satelliteLabels, showPorts]);

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
        positions: s.id === selectedId ? positions : undefined,
        stops: s.id === selectedId ? eventStops : undefined,
      })),
    [activeShipments, positions, eventStops, selectedId]
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
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(s.status)}`}
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
            <ShipmentMap
              shipments={mapShipments}
              selectedId={selectedId}
              onSelect={setSelectedId}
              showPorts={showPorts}
              basemap={mapType}
              satelliteLabels={satelliteLabels}
              className="h-[min(60vh,520px)] min-h-[320px]"
            />
            <button
              type="button"
              onClick={() => setLayersOpen(true)}
              className="absolute top-3 right-3 z-[500] flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-navy-800/90 px-3 text-sm text-text-primary shadow-lg backdrop-blur-sm hover:border-cobalt/40"
              aria-label="Map layers"
            >
              <Layers className="w-4 h-4 text-cobalt" />
              Layers
            </button>
          </div>
          <MapTypeSheet
            open={layersOpen}
            onOpenChange={setLayersOpen}
            mapType={mapType}
            onMapTypeChange={setMapType}
            satelliteLabels={satelliteLabels}
            onSatelliteLabelsChange={setSatelliteLabels}
            showPorts={showPorts}
            onShowPortsChange={setShowPorts}
          />
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
