/** Leaflet raster tile layers — Carto dark first, OSM fallback. */
export type MapTileLayerConfig = {
  url: string;
  attribution: string;
  subdomains?: string;
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
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  },
  {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
  },
];
