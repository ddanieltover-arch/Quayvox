import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_BASEMAPS, MAP_TILE_LAYERS, type MapBasemapId } from '@/lib/mapConfig';
import { interpolateCoords, lookupPortCoords, PORT_COORDINATES, type GeoCoord } from '@/lib/geoPorts';
import { geocodeAddressClient } from '@/lib/geocodeClient';
import { fetchSnappedRoute, formatRouteDuration } from '@/lib/routeClient';
import type { ShipmentPosition } from '@/lib/shipments';

export interface MapStopGeo {
  label: string;
  lat?: number | null;
  lng?: number | null;
  status?: string | null;
  message?: string | null;
  occurredAt?: string | null;
}

export interface MapShipmentGeo {
  id: string;
  trackingNumber: string;
  status: string;
  progress: number;
  origin?: string;
  destination?: string;
  currentAddress?: string | null;
  originLat?: number | null;
  originLng?: number | null;
  destinationLat?: number | null;
  destinationLng?: number | null;
  currentLat?: number | null;
  currentLng?: number | null;
  mode?: string;
  positions?: ShipmentPosition[];
  /** Timeline addresses to pin even when the GPS trail is incomplete. */
  stops?: MapStopGeo[];
}

interface ShipmentMapProps {
  shipments: MapShipmentGeo[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  showPorts?: boolean;
  className?: string;
  interactive?: boolean;
  basemap?: MapBasemapId;
  satelliteLabels?: boolean;
}

function applyBasemapTiles(
  map: L.Map,
  basemap: MapBasemapId,
  satelliteLabels: boolean,
  tileLayerRef: { current: L.TileLayer | null },
  overlayLayersRef: { current: L.TileLayer[] },
  tileFallbackRef: { current: number },
  setMapError: (msg: string | null) => void,
  useFallback: boolean
) {
  const config = MAP_BASEMAPS[basemap];
  if (!config) {
    setMapError('Map tiles failed to load');
    return;
  }
  const source = useFallback ? config.fallback ?? MAP_TILE_LAYERS[MAP_TILE_LAYERS.length - 1] : config;
  if (!source) {
    setMapError('Map tiles failed to load');
    return;
  }

  tileFallbackRef.current = useFallback ? 1 : 0;
  let tileErrors = 0;

  if (tileLayerRef.current) {
    map.removeLayer(tileLayerRef.current);
    tileLayerRef.current = null;
  }
  for (const overlay of overlayLayersRef.current) {
    map.removeLayer(overlay);
  }
  overlayLayersRef.current = [];

  const layer = L.tileLayer(source.url, {
    attribution: source.attribution,
    subdomains: source.subdomains,
    maxZoom: source.maxZoom ?? 19,
  });

  layer.on('tileerror', () => {
    tileErrors += 1;
    if (!useFallback && tileErrors >= 3 && config.fallback) {
      applyBasemapTiles(
        map,
        basemap,
        satelliteLabels,
        tileLayerRef,
        overlayLayersRef,
        tileFallbackRef,
        setMapError,
        true
      );
    } else if (tileErrors >= 3) {
      setMapError('Map tiles failed to load');
    }
  });

  layer.addTo(map);
  tileLayerRef.current = layer;

  const overlayConfigs =
    basemap === 'satellite' && satelliteLabels && !useFallback
      ? config.overlays ?? (config.labelsOverlay ? [config.labelsOverlay] : [])
      : [];

  for (const overlayConfig of overlayConfigs) {
    const overlay = L.tileLayer(overlayConfig.url, {
      attribution: overlayConfig.attribution,
      subdomains: overlayConfig.subdomains,
      maxZoom: overlayConfig.maxZoom ?? 19,
      pane: 'overlayPane',
    });
    overlay.addTo(map);
    overlayLayersRef.current.push(overlay);
  }

  setMapError(null);
}

/** Allow close clusters to zoom in; wide routes still fit naturally. */
function maxZoomForBounds(bounds: L.LatLngBounds): number {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const span = Math.max(Math.abs(ne.lat - sw.lat), Math.abs(ne.lng - sw.lng));
  if (span < 0.01) return 16;
  if (span < 0.05) return 15;
  if (span < 0.15) return 14;
  if (span < 0.5) return 12;
  if (span < 2) return 10;
  if (span < 8) return 8;
  return 6;
}

function padTinyBounds(bounds: L.LatLngBounds): L.LatLngBounds {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const span = Math.max(Math.abs(ne.lat - sw.lat), Math.abs(ne.lng - sw.lng));
  if (span >= 0.004) return bounds;
  const center = bounds.getCenter();
  const pad = 0.008;
  return L.latLngBounds(
    [center.lat - pad, center.lng - pad],
    [center.lat + pad, center.lng + pad]
  );
}

function stopLabel(stop: { label?: string | null } | null | undefined): string {
  return typeof stop?.label === 'string' ? stop.label.trim() : '';
}

function coordsClose(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
  epsilon = 0.00035
): boolean {
  return Math.abs(aLat - bLat) < epsilon && Math.abs(aLng - bLng) < epsilon;
}

function uniqueGeocodedStops(s: MapShipmentGeo): Array<{
  lat: number;
  lng: number;
  label: string;
  status?: string | null;
  message?: string | null;
}> {
  const out: Array<{
    lat: number;
    lng: number;
    label: string;
    status?: string | null;
    message?: string | null;
  }> = [];
  for (const stop of s.stops ?? []) {
    if (!isValidCoord(stop.lat, stop.lng)) continue;
    const lat = stop.lat as number;
    const lng = stop.lng as number;
    const last = out[out.length - 1];
    if (last && coordsClose(last.lat, last.lng, lat, lng)) {
      last.label = stopLabel(stop) || last.label;
      last.status = stop.status ?? last.status;
      last.message = stop.message ?? last.message;
      continue;
    }
    out.push({
      lat,
      lng,
      label: stopLabel(stop) || 'Stop',
      status: stop.status,
      message: stop.message,
    });
  }
  return out;
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
  if (s.currentAddress) {
    const lookup = lookupPortCoords(s.currentAddress);
    if (lookup) return lookup;
  }
  const origin = resolveOriginCoord(s);
  const destination = resolveDestinationCoord(s);
  if (origin && destination) {
    return interpolateCoords(origin, destination, s.progress);
  }
  // Pending / incomplete routes still show a pin at the known end.
  if (origin) return origin;
  if (destination) return destination;
  return null;
}

function shipmentHasGeo(s: MapShipmentGeo): boolean {
  return (
    resolveOriginCoord(s) != null ||
    resolveDestinationCoord(s) != null ||
    resolveDisplayPosition(s) != null ||
    uniqueGeocodedStops(s).length > 0
  );
}

function shipmentHasAddress(s: MapShipmentGeo): boolean {
  return Boolean(
    s.origin?.trim() ||
      s.destination?.trim() ||
      s.currentAddress?.trim() ||
      (s.stops ?? []).some((stop) => stopLabel(stop))
  );
}

export function shipmentHasMapGeo(s: MapShipmentGeo): boolean {
  return shipmentHasGeo(s) || shipmentHasAddress(s);
}

async function resolveShipmentGeo(s: MapShipmentGeo): Promise<MapShipmentGeo> {
  const next: MapShipmentGeo = { ...s };

  if (!isValidCoord(next.originLat, next.originLng) && next.origin?.trim()) {
    const coords = await geocodeAddressClient(next.origin);
    if (coords) {
      next.originLat = coords[0];
      next.originLng = coords[1];
    }
  }

  if (!isValidCoord(next.destinationLat, next.destinationLng) && next.destination?.trim()) {
    const coords = await geocodeAddressClient(next.destination);
    if (coords) {
      next.destinationLat = coords[0];
      next.destinationLng = coords[1];
    }
  }

  if (!isValidCoord(next.currentLat, next.currentLng) && next.currentAddress?.trim()) {
    const coords = await geocodeAddressClient(next.currentAddress);
    if (coords) {
      next.currentLat = coords[0];
      next.currentLng = coords[1];
    }
  }

  if (next.stops?.length) {
    const resolvedStops: MapStopGeo[] = [];
    for (const stop of next.stops) {
      if (isValidCoord(stop.lat, stop.lng) || !stopLabel(stop)) {
        resolvedStops.push(stop);
        continue;
      }
      const coords = await geocodeAddressClient(stopLabel(stop));
      resolvedStops.push(
        coords ? { ...stop, lat: coords[0], lng: coords[1] } : stop
      );
    }
    next.stops = resolvedStops;
  }

  return next;
}

function buildRouteLatLngs(s: MapShipmentGeo): L.LatLngExpression[] {
  const eventStops = uniqueGeocodedStops(s);
  if (eventStops.length >= 2) {
    return eventStops.map((stop) => [stop.lat, stop.lng]);
  }

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

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function geodesicSegment(a: GeoCoord, b: GeoCoord, steps = 18): GeoCoord[] {
  const lat1 = toRad(a[0]);
  const lng1 = toRad(a[1]);
  const lat2 = toRad(b[0]);
  const lng2 = toRad(b[1]);
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2
      )
    );
  if (!Number.isFinite(d) || d < 1e-8) return [a, b];

  const out: GeoCoord[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    out.push([toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))]);
  }
  return out;
}

function smoothCurve(points: L.LatLngExpression[]): L.LatLngExpression[] {
  if (points.length < 2) return points;
  const out: L.LatLngExpression[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i] as GeoCoord;
    const b = points[i + 1] as GeoCoord;
    const segment = geodesicSegment(a, b);
    if (i > 0) segment.shift();
    out.push(...segment);
  }
  return out;
}

function routeWaypoints(s: MapShipmentGeo): Array<[number, number]> {
  return buildRouteLatLngs(s)
    .map((point) => (Array.isArray(point) ? [Number(point[0]), Number(point[1])] : null))
    .filter((point): point is [number, number] => point != null && isValidCoord(point[0], point[1]));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createMarkerIcon(
  kind: 'origin' | 'destination' | 'current' | 'history',
  selected: boolean,
  onHold = false
): L.DivIcon {
  const live = kind === 'current';
  const holdCurrent = live && onHold;
  const classes = [
    'qv-map-marker',
    holdCurrent
      ? 'qv-map-marker--hold'
      : live
        ? 'qv-map-marker--current'
        : kind === 'origin'
          ? 'qv-map-marker--origin'
          : kind === 'history'
            ? 'qv-map-marker--history'
            : 'qv-map-marker--destination',
    selected ? 'qv-map-marker--selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (live) {
    const pingClass = holdCurrent ? 'qv-map-live__ping qv-map-live__ping--hold' : 'qv-map-live__ping';
    const core = holdCurrent
      ? `<button type="button" class="${classes}" aria-label="Latest location on hold"><span class="qv-map-marker__bang">!</span></button>`
      : `<button type="button" class="${classes}" aria-label="Latest location"></button>`;
    const html = `<span class="qv-map-live">${core}<span class="${pingClass}"></span><span class="${pingClass} qv-map-live__ping--delay"></span></span>`;
    return L.divIcon({
      className: 'qv-map-live-icon',
      html,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  }

  const size = kind === 'history' ? 10 : 12;
  return L.divIcon({
    className: '',
    html: `<button type="button" class="${classes}" aria-hidden="true"></button>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/** One-shot SVG stroke draw-in for a Leaflet polyline (no-op if path missing). */
function animatePolylineDrawIn(
  line: L.Polyline,
  durationMs = 800,
  onComplete?: () => void
): void {
  const run = () => {
    const path = line.getElement() as SVGPathElement | null | undefined;
    if (!path || typeof path.getTotalLength !== 'function') {
      onComplete?.();
      return;
    }

    const length = path.getTotalLength();
    if (!Number.isFinite(length) || length <= 0) {
      onComplete?.();
      return;
    }

    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    // Force layout so the browser registers the initial offset before transitioning.
    void path.getBoundingClientRect();
    path.style.transition = `stroke-dashoffset ${durationMs}ms ease-out`;

    requestAnimationFrame(() => {
      path.style.strokeDashoffset = '0';
    });

    window.setTimeout(() => {
      path.style.transition = '';
      path.style.strokeDasharray = '';
      path.style.strokeDashoffset = '';
      onComplete?.();
    }, durationMs + 60);
  };

  // Path element exists after the layer is painted.
  requestAnimationFrame(() => requestAnimationFrame(run));
}

const ROUTE_FLOW_DASH = '8 12';
const ROUTE_FLOW_CYCLE_PX = 20; // 8 + 12

/** Continuous dash flow along a route; returns a disposer. */
function startRouteDashFlow(line: L.Polyline): () => void {
  let cancelled = false;
  let path: SVGPathElement | null = null;

  const apply = () => {
    if (cancelled) return;
    path = (line.getElement() as SVGPathElement | null | undefined) ?? null;
    if (!path) return;
    line.setStyle({ dashArray: ROUTE_FLOW_DASH });
    path.style.setProperty('--qv-flow-cycle', `${ROUTE_FLOW_CYCLE_PX}px`);
    path.classList.add('qv-map-route--flow');
  };

  requestAnimationFrame(() => requestAnimationFrame(apply));

  return () => {
    cancelled = true;
    path = (line.getElement() as SVGPathElement | null | undefined) ?? path;
    path?.classList.remove('qv-map-route--flow');
    path?.style.removeProperty('--qv-flow-cycle');
    try {
      line.setStyle({ dashArray: undefined });
    } catch {
      // Layer may already be removed.
    }
  };
}

function coordsDiffer(a: GeoCoord, b: GeoCoord, epsilon = 1e-5): boolean {
  return Math.abs(a[0] - b[0]) > epsilon || Math.abs(a[1] - b[1]) > epsilon;
}

/** Ease a marker from its current lat/lng to a target. Returns a disposer. */
function animateMarkerTo(
  marker: L.Marker,
  to: GeoCoord,
  durationMs = 650
): () => void {
  const from = marker.getLatLng();
  const start = performance.now();
  let raf = 0;
  let cancelled = false;

  const tick = (now: number) => {
    if (cancelled) return;
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - (1 - t) ** 3; // ease-out cubic
    marker.setLatLng([
      from.lat + (to[0] - from.lat) * eased,
      from.lng + (to[1] - from.lng) * eased,
    ]);
    if (t < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      marker.setLatLng(to);
    }
  };

  raf = requestAnimationFrame(tick);

  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}

export function ShipmentMap({
  shipments,
  selectedId,
  onSelect,
  showPorts = false,
  className = '',
  interactive = true,
  basemap = 'default',
  satelliteLabels = true,
}: ShipmentMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routesRef = useRef<L.Polyline[]>([]);
  const markersRef = useRef<L.Marker[]>([]);
  const portsLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayLayersRef = useRef<L.TileLayer[]>([]);
  const fittedKeyRef = useRef<string>('');
  const drawnRouteIdsRef = useRef<Set<string>>(new Set());
  const stopRouteFlowRef = useRef<(() => void) | null>(null);
  const prevCurrentPositionsRef = useRef<Map<string, GeoCoord>>(new Map());
  const stopMarkerAnimsRef = useRef<(() => void)[]>([]);
  const tileFallbackRef = useRef(0);
  const basemapRef = useRef(basemap);
  const labelsRef = useRef(satelliteLabels);
  basemapRef.current = basemap;
  labelsRef.current = satelliteLabels;
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [resolvedShipments, setResolvedShipments] = useState<MapShipmentGeo[]>(shipments);
  const [locating, setLocating] = useState(false);
  const [snappedRoutes, setSnappedRoutes] = useState<
    Record<string, { coords: L.LatLngExpression[]; durationSec: number | null }>
  >({});

  const reduceMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    let cancelled = false;

    const needsLookup = shipments.some(
      (s) =>
        (!isValidCoord(s.originLat, s.originLng) && Boolean(s.origin?.trim())) ||
        (!isValidCoord(s.destinationLat, s.destinationLng) && Boolean(s.destination?.trim())) ||
        (!isValidCoord(s.currentLat, s.currentLng) && Boolean(s.currentAddress?.trim())) ||
        (s.stops ?? []).some((stop) => Boolean(stopLabel(stop)) && !isValidCoord(stop.lat, stop.lng))
    );

    if (!needsLookup) {
      setResolvedShipments(shipments);
      setLocating(false);
      return;
    }

    setLocating(true);
    setResolvedShipments(shipments);

    void (async () => {
      const next: MapShipmentGeo[] = [];
      for (const shipment of shipments) {
        if (cancelled) return;
        next.push(await resolveShipmentGeo(shipment));
      }
      if (!cancelled) {
        setResolvedShipments(next);
        setLocating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shipments]);

  const geoShipments = useMemo(
    () => resolvedShipments.filter(shipmentHasGeo),
    [resolvedShipments]
  );
  const hasGeo = geoShipments.length > 0;
  const hasAddressOnly =
    !hasGeo && resolvedShipments.some(shipmentHasAddress);

  useEffect(() => {
    let cancelled = false;
    const roadShipments = geoShipments.filter((s) => s.mode === 'Road');
    if (roadShipments.length === 0) {
      setSnappedRoutes({});
      return;
    }

    void (async () => {
      const next: Record<string, { coords: L.LatLngExpression[]; durationSec: number | null }> = {};
      for (const shipment of roadShipments) {
        const waypoints = routeWaypoints(shipment);
        if (waypoints.length < 2) continue;
        const snapped = await fetchSnappedRoute(waypoints);
        if (cancelled) return;
        if (snapped?.coordinates?.length) {
          next[shipment.id] = {
            coords: snapped.coordinates,
            durationSec: snapped.durationSec,
          };
        }
      }
      if (!cancelled) setSnappedRoutes(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [geoShipments]);

  useEffect(() => {
    if (!hasGeo || !containerRef.current) return;

    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;

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

    applyBasemapTiles(
      map,
      basemapRef.current,
      labelsRef.current,
      tileLayerRef,
      overlayLayersRef,
      tileFallbackRef,
      setMapError,
      false
    );

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
      overlayLayersRef.current = [];
      stopRouteFlowRef.current?.();
      stopRouteFlowRef.current = null;
      stopMarkerAnimsRef.current.forEach((stop) => stop());
      stopMarkerAnimsRef.current = [];
      prevCurrentPositionsRef.current.clear();
      drawnRouteIdsRef.current.clear();
      fittedKeyRef.current = '';
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [hasGeo, interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    applyBasemapTiles(
      map,
      basemap,
      satelliteLabels,
      tileLayerRef,
      overlayLayersRef,
      tileFallbackRef,
      setMapError,
      false
    );
  }, [mapReady, basemap, satelliteLabels]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    stopRouteFlowRef.current?.();
    stopRouteFlowRef.current = null;
    stopMarkerAnimsRef.current.forEach((stop) => stop());
    stopMarkerAnimsRef.current = [];

    routesRef.current.forEach((line) => line.remove());
    routesRef.current = [];
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (portsLayerRef.current) {
      portsLayerRef.current.remove();
      portsLayerRef.current = null;
    }

    const bounds = L.latLngBounds([]);
    const routesToDrawIn: { id: string; line: L.Polyline }[] = [];
    const pendingDrawIds = new Set<string>();
    const routeById = new Map<string, L.Polyline>();
    const seenCurrentIds = new Set<string>();

    const flowId =
      selectedId && geoShipments.some((s) => s.id === selectedId)
        ? selectedId
        : geoShipments.length === 1
          ? geoShipments[0].id
          : null;
    const multi = geoShipments.length > 1;

    for (const s of geoShipments) {
      const straight = buildRouteLatLngs(s);
      const snapped = s.mode === 'Road' ? snappedRoutes[s.id] : undefined;
      const route =
        snapped?.coords && snapped.coords.length >= 2
          ? snapped.coords
          : s.mode === 'Road'
            ? straight
            : smoothCurve(straight);
      if (route.length >= 2) {
        const isFlowTarget = flowId != null && s.id === flowId;
        const hold = s.status === 'On Hold';
        const faded = multi && flowId && !isFlowTarget;
        const casing = L.polyline(route, {
          color: hold ? '#7F1D1D' : '#1E3A8A',
          weight: isFlowTarget ? 10 : 8,
          opacity: faded ? 0.25 : 0.55,
          lineCap: 'round',
          lineJoin: 'round',
          className: 'qv-map-route-case',
        }).addTo(map);
        const line = L.polyline(route, {
          color: hold ? '#EF4444' : '#4F6DF5',
          weight: isFlowTarget ? 6 : 5,
          opacity: faded ? 0.45 : 1,
          lineCap: 'round',
          lineJoin: 'round',
          className: 'qv-map-route',
        }).addTo(map);
        const durationLabel = formatRouteDuration(snapped?.durationSec);
        if (durationLabel && isFlowTarget) {
          line.bindTooltip(durationLabel, {
            permanent: true,
            direction: 'center',
            className: 'qv-map-eta',
            opacity: 1,
          });
        }
        routesRef.current.push(casing, line);
        routeById.set(s.id, line);
        route.forEach((point) => bounds.extend(point));

        if (!drawnRouteIdsRef.current.has(s.id)) {
          if (!reduceMotion) {
            routesToDrawIn.push({ id: s.id, line });
            pendingDrawIds.add(s.id);
          } else {
            drawnRouteIdsRef.current.add(s.id);
          }
        }
      }

      const addMarker = (
        lat: number,
        lng: number,
        kind: 'origin' | 'destination' | 'current' | 'history',
        label: string,
        stopStatus?: string | null,
        stopMessage?: string | null
      ) => {
        let startLat = lat;
        let startLng = lng;

        if (kind === 'current' && !reduceMotion) {
          const prev = prevCurrentPositionsRef.current.get(s.id);
          if (prev && coordsDiffer(prev, [lat, lng])) {
            startLat = prev[0];
            startLng = prev[1];
          }
        }

        const pinStatus = (stopStatus?.trim() || (kind === 'current' ? s.status : '')).trim();
        const isOnHold = kind === 'current' && (pinStatus === 'On Hold' || s.status === 'On Hold');
        const statusLine =
          isOnHold && kind === 'current'
            ? '<span style="color:#DC2626;font-weight:700">On Hold — action required</span>'
            : pinStatus
              ? escapeHtml(pinStatus)
              : kind === 'history'
                ? 'Previous location'
                : escapeHtml(s.status);
        const messageLine =
          stopMessage?.trim() && stopMessage.trim() !== label
            ? `<br/>${escapeHtml(stopMessage.trim())}`
            : '';
        const marker = L.marker([startLat, startLng], {
          icon: createMarkerIcon(kind, s.id === selectedId, isOnHold),
          keyboard: false,
          zIndexOffset:
            kind === 'current' && isOnHold ? 600 : kind === 'current' ? 400 : kind === 'history' ? 200 : 0,
        })
          .bindPopup(
            `<div style="font:12px/1.4 system-ui,sans-serif;color:#0B1020">
              <strong>${escapeHtml(s.trackingNumber)}</strong><br/>${escapeHtml(label)}${messageLine}<br/>${statusLine}
            </div>`
          )
          .addTo(map);

        if (kind === 'current' && (startLat !== lat || startLng !== lng)) {
          stopMarkerAnimsRef.current.push(animateMarkerTo(marker, [lat, lng], 650));
        }

        if (onSelect) {
          marker.on('click', () => onSelect(s.id));
        }

        markersRef.current.push(marker);
        bounds.extend([lat, lng]);
      };

      const origin = resolveOriginCoord(s);
      const destination = resolveDestinationCoord(s);
      const eventStops = uniqueGeocodedStops(s);

      if (eventStops.length >= 2) {
        eventStops.forEach((stop, index) => {
          const isLatest = index === eventStops.length - 1;
          addMarker(
            stop.lat,
            stop.lng,
            isLatest ? 'current' : 'history',
            isLatest ? `Latest update — ${stop.label}` : stop.label,
            stop.status,
            stop.message
          );
          if (isLatest) {
            seenCurrentIds.add(s.id);
            prevCurrentPositionsRef.current.set(s.id, [stop.lat, stop.lng]);
          }
        });
      } else {
        if (origin) addMarker(origin[0], origin[1], 'origin', 'Origin');
        if (destination) addMarker(destination[0], destination[1], 'destination', 'Destination');
        const current = resolveDisplayPosition(s);
        const trail = (s.positions ?? []).filter((p) => isValidCoord(p.lat, p.lng));
        for (const point of trail) {
          const sameAsCurrent =
            current != null && coordsClose(point.lat, point.lng, current[0], current[1]);
          if (sameAsCurrent) continue;
          addMarker(point.lat, point.lng, 'history', point.label?.trim() || 'Previous location');
        }
        if (current) {
          seenCurrentIds.add(s.id);
          addMarker(
            current[0],
            current[1],
            'current',
            s.currentAddress?.trim()
              ? `Latest update — ${s.currentAddress.trim()}`
              : 'Latest update'
          );
          prevCurrentPositionsRef.current.set(s.id, [current[0], current[1]]);
        }
      }
    }

    // Drop stale position memory for shipments no longer on the map.
    for (const id of prevCurrentPositionsRef.current.keys()) {
      if (!seenCurrentIds.has(id)) prevCurrentPositionsRef.current.delete(id);
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

    const fitKey = `${selectedId ?? 'all'}:${geoShipments
      .map((s) => {
        const cur = resolveDisplayPosition(s);
        return `${s.id}:${s.progress}:${cur?.[0] ?? ''}:${cur?.[1] ?? ''}:${s.currentAddress ?? ''}:${(s.positions ?? []).length}:${(s.stops ?? [])
          .map((stop) => `${stop.label}:${stop.lat ?? ''}:${stop.lng ?? ''}`)
          .join(',')}`;
      })
      .join('|')}`;

    let fittingBounds = false;
    if (bounds.isValid() && interactive && fitKey !== fittedKeyRef.current) {
      fittedKeyRef.current = fitKey;

      const selected = selectedId ? geoShipments.find((s) => s.id === selectedId) : undefined;
      let targetBounds = bounds;

      if (selected) {
        const selectedBounds = L.latLngBounds([]);
        const extend = (lat: number, lng: number) => {
          selectedBounds.extend([lat, lng]);
        };
        const o = resolveOriginCoord(selected);
        const d = resolveDestinationCoord(selected);
        const stops = uniqueGeocodedStops(selected);
        if (stops.length >= 2) {
          for (const stop of stops) extend(stop.lat, stop.lng);
        } else {
          if (o) extend(o[0], o[1]);
          if (d) extend(d[0], d[1]);
          const cur = resolveDisplayPosition(selected);
          if (cur) extend(cur[0], cur[1]);
        }
        if (selectedBounds.isValid()) {
          targetBounds = selectedBounds;
        }
      }

      targetBounds = padTinyBounds(targetBounds);
      map.fitBounds(targetBounds, {
        padding: [56, 56],
        maxZoom: maxZoomForBounds(targetBounds),
        animate: !reduceMotion,
        duration: reduceMotion ? 0 : 0.6,
      });
      fittingBounds = !reduceMotion;
    }

    const flowLine = flowId && !reduceMotion ? routeById.get(flowId) ?? null : null;
    const activeNeedsDrawIn = flowId != null && pendingDrawIds.has(flowId);

    const beginFlow = (line: L.Polyline) => {
      stopRouteFlowRef.current?.();
      stopRouteFlowRef.current = startRouteDashFlow(line);
    };

    let drawTimeout: number | undefined;
    let drewRoutes = false;
    const drawRoutes = () => {
      if (drewRoutes) return;
      drewRoutes = true;
      if (drawTimeout != null) {
        window.clearTimeout(drawTimeout);
        drawTimeout = undefined;
      }
      map.off('moveend', drawRoutes);
      for (const item of routesToDrawIn) {
        const startFlowAfter =
          flowLine && item.id === flowId ? () => beginFlow(item.line) : undefined;
        animatePolylineDrawIn(item.line, 800, startFlowAfter);
      }
      for (const id of pendingDrawIds) {
        drawnRouteIdsRef.current.add(id);
      }
      pendingDrawIds.clear();
      routesToDrawIn.length = 0;

      if (flowLine && !activeNeedsDrawIn) {
        beginFlow(flowLine);
      }
    };

    if (routesToDrawIn.length > 0) {
      if (fittingBounds) {
        map.once('moveend', drawRoutes);
        drawTimeout = window.setTimeout(drawRoutes, 700);
      } else {
        drawRoutes();
      }
    } else if (flowLine) {
      beginFlow(flowLine);
    }

    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      if (drawTimeout != null) window.clearTimeout(drawTimeout);
      map.off('moveend', drawRoutes);
      stopRouteFlowRef.current?.();
      stopRouteFlowRef.current = null;
      stopMarkerAnimsRef.current.forEach((stop) => stop());
      stopMarkerAnimsRef.current = [];
      // Allow retry if this effect cleaned up before draw-in ran (e.g. Strict Mode).
      pendingDrawIds.clear();
    };
  }, [geoShipments, selectedId, onSelect, showPorts, interactive, reduceMotion, mapReady, snappedRoutes]);

  if (!hasGeo) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-white/10 bg-navy-900/60 text-sm text-text-secondary min-h-[16rem] px-4 text-center ${className}`}
      >
        {locating || hasAddressOnly
          ? 'Locating address on map…'
          : 'Map appears once origin, destination, or a current address can be located'}
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
        .qv-map-live-icon {
          overflow: visible !important;
          background: none !important;
          border: none !important;
        }
        .qv-map-live {
          position: relative;
          display: block;
          width: 44px;
          height: 44px;
        }
        .qv-map-live .qv-map-marker {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }
        .qv-map-live__ping {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 44px;
          height: 44px;
          margin: -22px 0 0 -22px;
          border-radius: 9999px;
          border: 2px solid rgba(79, 109, 245, 0.95);
          box-sizing: border-box;
          animation: qv-map-beep 1.6s ease-out infinite;
          pointer-events: none;
        }
        .qv-map-live__ping--hold {
          border-color: rgba(239, 68, 68, 0.95);
        }
        .qv-map-live__ping--delay {
          animation-delay: 0.8s;
        }
        .qv-map-marker--origin { background: #94A3B8; }
        .qv-map-marker--destination { background: #22C55E; }
        .qv-map-marker--history {
          width: 10px;
          height: 10px;
          background: #F59E0B;
          border: 2px solid #0B1020;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.28);
        }
        .qv-map-marker--current {
          width: 20px;
          height: 20px;
          background: #4F6DF5;
          border: 3px solid #F4F6FF;
          box-shadow: 0 0 0 3px rgba(79, 109, 245, 0.45);
        }
        .qv-map-marker--hold {
          width: 24px;
          height: 24px;
          background: #DC2626;
          border: 3px solid #FEE2E2;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qv-map-marker__bang {
          color: #fff;
          font: 800 13px/1 system-ui, sans-serif;
          pointer-events: none;
        }
        .qv-map-marker--selected {
          outline: 2px solid #fff;
          outline-offset: 2px;
        }
        @keyframes qv-map-beep {
          0% {
            transform: scale(0.28);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        @keyframes qv-map-route-flow {
          to {
            stroke-dashoffset: calc(var(--qv-flow-cycle, 20px) * -1);
          }
        }
        .qv-map-route--flow {
          animation: qv-map-route-flow 1.8s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .qv-map-live__ping {
            animation: none;
            opacity: 0.45;
            transform: scale(0.7);
          }
          .qv-map-route--flow {
            animation: none;
          }
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
        .qv-map-eta {
          background: #1E3A8A;
          color: #F4F6FF;
          border: none;
          border-radius: 9999px;
          padding: 4px 10px;
          font: 600 11px/1.2 system-ui, sans-serif;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }
        .qv-map-eta::before {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default ShipmentMap;
