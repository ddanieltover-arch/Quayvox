import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  type GeoJSONSource,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DEFAULT_MAP_STYLE, MAP_STYLE_URLS } from '@/lib/mapConfig';
import { interpolateCoords, lookupPortCoords, type GeoCoord } from '@/lib/geoPorts';
import type { ShipmentPosition } from '@/lib/shipments';

const ROUTE_SOURCE = 'qv-route';
const ROUTE_LAYER = 'qv-route-line';
const PORTS_SOURCE = 'qv-ports';
const PORTS_LAYER = 'qv-ports-circle';

type MapFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: Record<string, string>;
    geometry:
      | { type: 'LineString'; coordinates: [number, number][] }
      | { type: 'Point'; coordinates: [number, number] };
  }>;
};

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
  return resolveOriginCoord(s) != null || resolveDestinationCoord(s) != null || resolveDisplayPosition(s) != null;
}

function buildRouteGeoJson(shipments: MapShipmentGeo[]): MapFeatureCollection {
  const features: MapFeatureCollection['features'] = [];

  for (const s of shipments) {
    const coords: [number, number][] = [];
    const origin = resolveOriginCoord(s);
    const destination = resolveDestinationCoord(s);

    if (origin) coords.push([origin[1], origin[0]]);
    const trail = (s.positions ?? []).filter((p) => isValidCoord(p.lat, p.lng));
    for (const p of trail) {
      coords.push([p.lng, p.lat]);
    }
    const current = resolveDisplayPosition(s);
    if (current && trail.length === 0) {
      coords.push([current[1], current[0]]);
    } else if (current && trail.length > 0) {
      const last = trail[trail.length - 1];
      if (last.lat !== current[0] || last.lng !== current[1]) {
        coords.push([current[1], current[0]]);
      }
    }
    if (destination) coords.push([destination[1], destination[0]]);
    if (coords.length >= 2) {
      features.push({
        type: 'Feature',
        properties: { id: s.id },
        geometry: { type: 'LineString', coordinates: coords },
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

function buildPortsGeoJson(ports: Record<string, GeoCoord>): MapFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: Object.entries(ports).map(([name, [lat, lng]]) => ({
      type: 'Feature',
      properties: { name },
      geometry: { type: 'Point', coordinates: [lng, lat] },
    })),
  };
}

function ensureRouteLayer(map: MapLibreMap) {
  if (!map.getSource(ROUTE_SOURCE)) {
    map.addSource(ROUTE_SOURCE, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id: ROUTE_LAYER,
      type: 'line',
      source: ROUTE_SOURCE,
      paint: {
        'line-color': '#4F6DF5',
        'line-width': 2.5,
        'line-opacity': 0.85,
      },
    });
  }
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
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const fittedKeyRef = useRef<string>('');
  const styleIndexRef = useRef(0);
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
    let map: MapLibreMap | null = null;

    const tryStyle = (index: number) => {
      if (disposed || !containerRef.current) return;

      const styleUrl = MAP_STYLE_URLS[index] ?? DEFAULT_MAP_STYLE;
      styleIndexRef.current = index;

      if (map) {
        map.remove();
        map = null;
        mapRef.current = null;
      }

      map = new MapLibreMap({
        container: containerRef.current,
        style: styleUrl,
        center: [10, 20],
        zoom: 1.4,
        cooperativeGestures: true,
      });

      mapRef.current = map;
      map.addControl(new NavigationControl({ showCompass: false }), 'top-right');

      map.on('error', (event) => {
        const message = event.error?.message ?? 'Map failed to load';
        if (index + 1 < MAP_STYLE_URLS.length) {
          tryStyle(index + 1);
          return;
        }
        setMapError(message);
      });

      map.on('load', () => {
        if (disposed || !map) return;
        ensureRouteLayer(map);
        setMapError(null);
        setMapReady(true);
        requestAnimationFrame(() => map?.resize());
      });

      resizeObserver = new ResizeObserver(() => {
        map?.resize();
      });
      resizeObserver.observe(containerRef.current);
    };

    setMapReady(false);
    setMapError(null);
    tryStyle(styleIndexRef.current);

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [hasGeo]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const apply = () => {
      if (!map.isStyleLoaded()) return;

      const routeSource = map.getSource(ROUTE_SOURCE) as GeoJSONSource | undefined;
      if (routeSource) {
        routeSource.setData(buildRouteGeoJson(geoShipments) as never);
      } else {
        ensureRouteLayer(map);
      }

      if (showPorts) {
        void import('@/lib/geoPorts').then(({ PORT_COORDINATES }) => {
          if (!map.getSource(PORTS_SOURCE)) {
            map.addSource(PORTS_SOURCE, {
              type: 'geojson',
              data: buildPortsGeoJson(PORT_COORDINATES) as never,
            });
            map.addLayer({
              id: PORTS_LAYER,
              type: 'circle',
              source: PORTS_SOURCE,
              paint: {
                'circle-radius': 4,
                'circle-color': '#94A3B8',
                'circle-opacity': 0.7,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#0B1020',
              },
            });
          }
        });
      } else if (map.getLayer(PORTS_LAYER)) {
        map.removeLayer(PORTS_LAYER);
        if (map.getSource(PORTS_SOURCE)) map.removeSource(PORTS_SOURCE);
      }

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const bounds = new LngLatBounds();
      let hasBounds = false;

      for (const s of geoShipments) {
        const addMarker = (
          lat: number,
          lng: number,
          kind: 'origin' | 'destination' | 'current',
          label: string
        ) => {
          const el = document.createElement('button');
          el.type = 'button';
          el.setAttribute('aria-label', label);
          el.className =
            kind === 'current'
              ? 'qv-map-marker qv-map-marker--current'
              : kind === 'origin'
                ? 'qv-map-marker qv-map-marker--origin'
                : 'qv-map-marker qv-map-marker--destination';
          if (s.id === selectedId) el.classList.add('qv-map-marker--selected');
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            onSelect?.(s.id);
          });

          const marker = new Marker({ element: el, anchor: 'center' })
            .setLngLat([lng, lat])
            .setPopup(
              new Popup({ offset: 12, closeButton: false }).setHTML(
                `<div style="font:12px/1.4 system-ui,sans-serif;color:#0B1020">
                  <strong>${s.trackingNumber}</strong><br/>${label}<br/>${s.status}
                </div>`
              )
            )
            .addTo(map);

          markersRef.current.push(marker);
          bounds.extend([lng, lat]);
          hasBounds = true;
        };

        const origin = resolveOriginCoord(s);
        const destination = resolveDestinationCoord(s);
        if (origin) addMarker(origin[0], origin[1], 'origin', 'Origin');
        if (destination) addMarker(destination[0], destination[1], 'destination', 'Destination');
        const current = resolveDisplayPosition(s);
        if (current) addMarker(current[0], current[1], 'current', 'Current position');
      }

      const fitKey = `${selectedId ?? 'all'}:${geoShipments.map((s) => s.id).join(',')}`;
      if (hasBounds && interactive && fitKey !== fittedKeyRef.current) {
        fittedKeyRef.current = fitKey;
        const selected = selectedId
          ? geoShipments.find((s) => s.id === selectedId)
          : undefined;
        if (selected) {
          const selectedBounds = new LngLatBounds();
          let selectedHas = false;
          const extend = (lat: number, lng: number) => {
            selectedBounds.extend([lng, lat]);
            selectedHas = true;
          };
          const o = resolveOriginCoord(selected);
          const d = resolveDestinationCoord(selected);
          if (o) extend(o[0], o[1]);
          if (d) extend(d[0], d[1]);
          const cur = resolveDisplayPosition(selected);
          if (cur) extend(cur[0], cur[1]);
          if (selectedHas) {
            map.fitBounds(selectedBounds, {
              padding: 56,
              maxZoom: 6,
              duration: reduceMotion ? 0 : 600,
            });
            return;
          }
        }
        map.fitBounds(bounds, {
          padding: 56,
          maxZoom: 6,
          duration: reduceMotion ? 0 : 600,
        });
      }

      requestAnimationFrame(() => map.resize());
    };

    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
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
      <div ref={containerRef} className="h-full w-full min-h-[inherit]" />
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
        .maplibregl-popup-content { border-radius: 8px; padding: 8px 10px; }
        .maplibregl-map { height: 100%; width: 100%; }
        .maplibregl-canvas { width: 100% !important; height: 100% !important; }
      `}</style>
    </div>
  );
}

export default ShipmentMap;
