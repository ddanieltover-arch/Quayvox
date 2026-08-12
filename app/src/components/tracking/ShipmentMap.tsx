import { useEffect, useMemo, useRef } from 'react';
import {
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  type GeoJSONSource,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { interpolateCoords, type GeoCoord } from '@/lib/geoPorts';
import type { ShipmentPosition } from '@/lib/shipments';

const DEFAULT_STYLE =
  (import.meta.env.VITE_MAP_STYLE_URL as string | undefined)?.trim() ||
  'https://tiles.openfreemap.org/styles/dark';

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
  /** When true, fit bounds only on first load / selection change, not every poll. */
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

export function resolveDisplayPosition(s: MapShipmentGeo): GeoCoord | null {
  if (isValidCoord(s.currentLat, s.currentLng)) {
    return [s.currentLat as number, s.currentLng as number];
  }
  if (
    isValidCoord(s.originLat, s.originLng) &&
    isValidCoord(s.destinationLat, s.destinationLng)
  ) {
    return interpolateCoords(
      [s.originLat as number, s.originLng as number],
      [s.destinationLat as number, s.destinationLng as number],
      s.progress
    );
  }
  return null;
}

function shipmentHasGeo(s: MapShipmentGeo): boolean {
  return (
    isValidCoord(s.originLat, s.originLng) ||
    isValidCoord(s.destinationLat, s.destinationLng) ||
    resolveDisplayPosition(s) != null
  );
}

function buildRouteGeoJson(shipments: MapShipmentGeo[]): MapFeatureCollection {
  const features: MapFeatureCollection['features'] = [];

  for (const s of shipments) {
    const coords: [number, number][] = [];
    if (isValidCoord(s.originLat, s.originLng)) {
      coords.push([s.originLng as number, s.originLat as number]);
    }
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
    if (isValidCoord(s.destinationLat, s.destinationLng)) {
      coords.push([s.destinationLng as number, s.destinationLat as number]);
    }
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
  const reduceMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const geoShipments = useMemo(() => shipments.filter(shipmentHasGeo), [shipments]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: DEFAULT_STYLE,
      center: [10, 20],
      zoom: 1.4,
      cooperativeGestures: true,
    });

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
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
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      const routeSource = map.getSource(ROUTE_SOURCE) as GeoJSONSource | undefined;
      if (routeSource) {
        routeSource.setData(buildRouteGeoJson(geoShipments) as never);
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

        if (isValidCoord(s.originLat, s.originLng)) {
          addMarker(s.originLat as number, s.originLng as number, 'origin', 'Origin');
        }
        if (isValidCoord(s.destinationLat, s.destinationLng)) {
          addMarker(
            s.destinationLat as number,
            s.destinationLng as number,
            'destination',
            'Destination'
          );
        }
        const current = resolveDisplayPosition(s);
        if (current) {
          addMarker(current[0], current[1], 'current', 'Current position');
        }
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
          if (isValidCoord(selected.originLat, selected.originLng)) {
            extend(selected.originLat as number, selected.originLng as number);
          }
          if (isValidCoord(selected.destinationLat, selected.destinationLng)) {
            extend(selected.destinationLat as number, selected.destinationLng as number);
          }
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
    };

    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [geoShipments, selectedId, onSelect, showPorts, interactive, reduceMotion]);

  if (geoShipments.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-white/10 bg-navy-900/60 text-sm text-text-secondary ${className}`}
      >
        Location updates when the shipment is scanned
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 ${className}`}>
      <div ref={containerRef} className="absolute inset-0" />
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
      `}</style>
    </div>
  );
}

export default ShipmentMap;
