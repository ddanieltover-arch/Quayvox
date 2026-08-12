import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_TILE_LAYERS } from '@/lib/mapConfig';
import { interpolateCoords, lookupPortCoords, PORT_COORDINATES, type GeoCoord } from '@/lib/geoPorts';
import type { ShipmentPosition } from '@/lib/shipments';

export interface MapShipmentGeo {
  id: string;
  trackingNumber: string;
  status: string;
  progress: number;
  origin?: string;
  destination?: string;
  originLat?: number | null;
  originLng?: number | null;
  destinationLat?: number | null;
  destinationLng?: number | null;
  currentLat?: number | null;
  currentLng?: number | null;
  positions?: ShipmentPosition[];
}

interface ShipmentMapProps {
  shipments: MapShipmentGeo[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  showPorts?: boolean;
  className?: string;
  interactive?: boolean;
}

function isValidCoord(lat: number | null | undefined, lng: number | null | undefined): boolean {
  return (
    lat != null &&
    lng != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

function resolveOriginCoord(s: MapShipmentGeo): GeoCoord | null {
  if (isValidCoord(s.originLat, s.originLng)) {
    return [s.originLat as number, s.originLng as number];
  }
  if (s.origin) {
    const lookup = lookupPortCoords(s.origin);
    if (lookup) return lookup;
  }
  return null;
}

function resolveDestinationCoord(s: MapShipmentGeo): GeoCoord | null {
  if (isValidCoord(s.destinationLat, s.destinationLng)) {
    return [s.destinationLat as number, s.destinationLng as number];
  }
  if (s.destination) {
    const lookup = lookupPortCoords(s.destination);
    if (lookup) return lookup;
  }
  return null;
}

export function resolveDisplayPosition(s: MapShipmentGeo): GeoCoord | null {
  if (isValidCoord(s.currentLat, s.currentLng)) {
    return [s.currentLat as number, s.currentLng as number];
  }
  const origin = resolveOriginCoord(s);
  const destination = resolveDestinationCoord(s);
  if (origin && destination) {
    return interpolateCoords(origin, destination, s.progress);
  }
  return null;
}

function shipmentHasGeo(s: MapShipmentGeo): boolean {
  return (
    resolveOriginCoord(s) != null ||
    resolveDestinationCoord(s) != null ||
    resolveDisplayPosition(s) != null
  );
}

function buildRouteLatLngs(s: MapShipmentGeo): L.LatLngExpression[] {
  const coords: L.LatLngExpression[] = [];
  const origin = resolveOriginCoord(s);
  const destination = resolveDestinationCoord(s);

  if (origin) coords.push([origin[0], origin[1]]);
  const trail = (s.positions ?? []).filter((p) => isValidCoord(p.lat, p.lng));
  for (const p of trail) {
    coords.push([p.lat, p.lng]);
  }
  const current = resolveDisplayPosition(s);
  if (current && trail.length === 0) {
    coords.push([current[0], current[1]]);
  } else if (current && trail.length > 0) {
    const last = trail[trail.length - 1];
    if (last.lat !== current[0] || last.lng !== current[1]) {
      coords.push([current[0], current[1]]);
    }
  }
  if (destination) coords.push([destination[0], destination[1]]);
  return coords;
}

function createMarkerIcon(kind: 'origin' | 'destination' | 'current', selected: boolean): L.DivIcon {
  const classes = [
    'qv-map-marker',
    kind === 'current'
      ? 'qv-map-marker--current'
      : kind === 'origin'
        ? 'qv-map-marker--origin'
        : 'qv-map-marker--destination',
    selected ? 'qv-map-marker--selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return L.divIcon({
    className: '',
    html: `<button type="button" class="${classes}" aria-hidden="true"></button>`,
    iconSize: kind === 'current' ? [16, 16] : [12, 12],
    iconAnchor: kind === 'current' ? [8, 8] : [6, 6],
  });
}

export function ShipmentMap({
  shipments,
  selectedId,
  onSelect,
  showPorts = false,
  className = '',
  interactive = true,
}: ShipmentMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routesRef = useRef<L.Polyline[]>([]);
  const markersRef = useRef<L.Marker[]>([]);
  const portsLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const fittedKeyRef = useRef<string>('');
  const tileIndexRef = useRef(0);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const reduceMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const geoShipments = useMemo(() => shipments.filter(shipmentHasGeo), [shipments]);
  const hasGeo = geoShipments.length > 0;

  useEffect(() => {
    if (!hasGeo || !containerRef.current) return;

    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;
    let tileErrors = 0;

    const map = L.map(containerRef.current, {
      center: [20, 10],
      zoom: 2,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: interactive,
      dragging: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
    });

    mapRef.current = map;

    const mountTileLayer = (index: number) => {
      if (disposed) return;
      const config = MAP_TILE_LAYERS[index];
      if (!config) {
        setMapError('Map tiles failed to load');
        return;
      }

      tileIndexRef.current = index;
      tileErrors = 0;

      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }

      const layer = L.tileLayer(config.url, {
        attribution: config.attribution,
        subdomains: config.subdomains,
        maxZoom: 19,
      });

      layer.on('tileerror', () => {
        tileErrors += 1;
        if (tileErrors >= 3 && index + 1 < MAP_TILE_LAYERS.length) {
          mountTileLayer(index + 1);
        } else if (tileErrors >= 3 && index + 1 >= MAP_TILE_LAYERS.length) {
          setMapError('Map tiles failed to load');
        }
      });

      layer.addTo(map);
      tileLayerRef.current = layer;
    };

    mountTileLayer(tileIndexRef.current);

    map.whenReady(() => {
      if (disposed) return;
      setMapError(null);
      setMapReady(true);
      requestAnimationFrame(() => map.invalidateSize());
    });

    resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      routesRef.current = [];
      markersRef.current = [];
      portsLayerRef.current = null;
      tileLayerRef.current = null;
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [hasGeo, interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    routesRef.current.forEach((line) => line.remove());
    routesRef.current = [];
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (portsLayerRef.current) {
      portsLayerRef.current.remove();
      portsLayerRef.current = null;
    }

    const bounds = L.latLngBounds([]);

    for (const s of geoShipments) {
      const route = buildRouteLatLngs(s);
      if (route.length >= 2) {
        const line = L.polyline(route, {
          color: '#4F6DF5',
          weight: 2.5,
          opacity: 0.85,
        }).addTo(map);
        routesRef.current.push(line);
        route.forEach((point) => bounds.extend(point));
      }

      const addMarker = (
        lat: number,
        lng: number,
        kind: 'origin' | 'destination' | 'current',
        label: string
      ) => {
        const marker = L.marker([lat, lng], {
          icon: createMarkerIcon(kind, s.id === selectedId),
          keyboard: false,
        })
          .bindPopup(
            `<div style="font:12px/1.4 system-ui,sans-serif;color:#0B1020">
              <strong>${s.trackingNumber}</strong><br/>${label}<br/>${s.status}
            </div>`
          )
          .addTo(map);

        if (onSelect) {
          marker.on('click', () => onSelect(s.id));
        }

        markersRef.current.push(marker);
        bounds.extend([lat, lng]);
      };

      const origin = resolveOriginCoord(s);
      const destination = resolveDestinationCoord(s);
      if (origin) addMarker(origin[0], origin[1], 'origin', 'Origin');
      if (destination) addMarker(destination[0], destination[1], 'destination', 'Destination');
      const current = resolveDisplayPosition(s);
      if (current) addMarker(current[0], current[1], 'current', 'Current position');
    }

    if (showPorts) {
      const group = L.layerGroup();
      for (const [name, [lat, lng]] of Object.entries(PORT_COORDINATES)) {
        L.circleMarker([lat, lng], {
          radius: 4,
          color: '#0B1020',
          weight: 1,
          fillColor: '#94A3B8',
          fillOpacity: 0.7,
        })
          .bindTooltip(name, { direction: 'top', opacity: 0.9 })
          .addTo(group);
      }
      group.addTo(map);
      portsLayerRef.current = group;
    }

    const fitKey = `${selectedId ?? 'all'}:${geoShipments.map((s) => s.id).join(',')}`;
    if (bounds.isValid() && interactive && fitKey !== fittedKeyRef.current) {
      fittedKeyRef.current = fitKey;

      const selected = selectedId ? geoShipments.find((s) => s.id === selectedId) : undefined;
      if (selected) {
        const selectedBounds = L.latLngBounds([]);
        const extend = (lat: number, lng: number) => {
          selectedBounds.extend([lat, lng]);
        };
        const o = resolveOriginCoord(selected);
        const d = resolveDestinationCoord(selected);
        if (o) extend(o[0], o[1]);
        if (d) extend(d[0], d[1]);
        const cur = resolveDisplayPosition(selected);
        if (cur) extend(cur[0], cur[1]);
        if (selectedBounds.isValid()) {
          map.fitBounds(selectedBounds, {
            padding: [56, 56],
            maxZoom: 6,
            animate: !reduceMotion,
            duration: reduceMotion ? 0 : 0.6,
          });
          return;
        }
      }

      map.fitBounds(bounds, {
        padding: [56, 56],
        maxZoom: 6,
        animate: !reduceMotion,
        duration: reduceMotion ? 0 : 0.6,
      });
    }

    requestAnimationFrame(() => map.invalidateSize());
  }, [geoShipments, selectedId, onSelect, showPorts, interactive, reduceMotion, mapReady]);

  if (!hasGeo) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-white/10 bg-navy-900/60 text-sm text-text-secondary min-h-[16rem] ${className}`}
      >
        Location updates when the shipment is scanned
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/10 min-h-[16rem] ${className}`}
    >
      <div ref={containerRef} className="h-full w-full min-h-[inherit] z-0" />
      {!mapReady && !mapError && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy-900/40 text-xs text-text-secondary">
          Loading map…
        </div>
      )}
      {mapError && (
        <div className="absolute inset-x-0 bottom-0 bg-red-950/80 px-3 py-2 text-xs text-red-200">
          {mapError}
        </div>
      )}
      <style>{`
        .qv-map-marker {
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          border: 2px solid #0B1020;
          cursor: pointer;
          padding: 0;
          display: block;
        }
        .qv-map-marker--origin { background: #94A3B8; }
        .qv-map-marker--destination { background: #22C55E; }
        .qv-map-marker--current {
          width: 16px;
          height: 16px;
          background: #4F6DF5;
          box-shadow: 0 0 0 4px rgba(79, 109, 245, 0.35);
        }
        .qv-map-marker--selected {
          outline: 2px solid #fff;
          outline-offset: 2px;
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
          background: #0B1020;
          font: inherit;
        }
        .leaflet-control-attribution {
          font-size: 10px;
          background: rgba(11, 16, 32, 0.85) !important;
          color: #94A3B8 !important;
        }
        .leaflet-control-attribution a {
          color: #94A3B8;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

export default ShipmentMap;
