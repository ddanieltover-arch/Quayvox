/** Leaflet raster tile layers — Carto dark first, OSM fallback. */
export type MapTileLayerConfig = {
  url: string;
  attribution: string;
  subdomains?: string;
  maxZoom?: number;
};

export type MapBasemapId = 'default' | 'satellite' | 'terrain';

export type MapBasemapConfig = MapTileLayerConfig & {
  id: MapBasemapId;
  label: string;
  fallback?: MapTileLayerConfig;
  labelsOverlay?: MapTileLayerConfig;
  overlays?: MapTileLayerConfig[];
};

export const MAP_TILE_LAYERS: MapTileLayerConfig[] = [
  ...(import.meta.env.VITE_MAP_TILE_URL
    ? [
        {
          url: String(import.meta.env.VITE_MAP_TILE_URL).trim(),
          attribution:
            (import.meta.env.VITE_MAP_TILE_ATTRIBUTION as string | undefined)?.trim() ||
            '&copy; Map contributors',
        },
      ]
    : []),
  {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  },
  {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
];

const OSM_FALLBACK: MapTileLayerConfig = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abc',
  maxZoom: 19,
};

const ESRI_TOPO: MapTileLayerConfig = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  attribution:
    'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
  maxZoom: 19,
};

export const SATELLITE_LABELS_OVERLAY: MapTileLayerConfig = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20,
};

const ESRI_IMAGERY: MapTileLayerConfig = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution:
    'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  maxZoom: 19,
};

const CARTO_VOYAGER: MapTileLayerConfig = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20,
};

export const MAP_BASEMAPS: Record<MapBasemapId, MapBasemapConfig> = {
  default: {
    id: 'default',
    label: 'Default',
    url: MAP_TILE_LAYERS[0]?.url ?? OSM_FALLBACK.url,
    attribution: MAP_TILE_LAYERS[0]?.attribution ?? OSM_FALLBACK.attribution,
    subdomains: MAP_TILE_LAYERS[0]?.subdomains,
    maxZoom: MAP_TILE_LAYERS[0]?.maxZoom ?? 20,
    fallback: OSM_FALLBACK,
  },
  satellite: {
    id: 'satellite',
    label: 'Satellite',
    url: ESRI_IMAGERY.url,
    attribution: ESRI_IMAGERY.attribution,
    maxZoom: ESRI_IMAGERY.maxZoom,
    fallback: OSM_FALLBACK,
    labelsOverlay: SATELLITE_LABELS_OVERLAY,
    overlays: [SATELLITE_LABELS_OVERLAY],
  },
  terrain: {
    id: 'terrain',
    label: 'Terrain',
    url: CARTO_VOYAGER.url,
    attribution: CARTO_VOYAGER.attribution,
    subdomains: CARTO_VOYAGER.subdomains,
    maxZoom: CARTO_VOYAGER.maxZoom,
    fallback: ESRI_TOPO,
  },
};

export const MAP_BASEMAP_IDS: MapBasemapId[] = ['default', 'satellite', 'terrain'];

export function isMapBasemapId(value: string | null | undefined): value is MapBasemapId {
  return value === 'default' || value === 'satellite' || value === 'terrain';
}
