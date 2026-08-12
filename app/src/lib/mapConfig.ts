/** MapLibre style URLs — OpenFreeMap can fail in some networks; demotiles is the fallback. */
export const MAP_STYLE_URLS = [
  (import.meta.env.VITE_MAP_STYLE_URL as string | undefined)?.trim(),
  'https://demotiles.maplibre.org/style.json',
  'https://tiles.openfreemap.org/styles/dark',
].filter((url): url is string => Boolean(url));

export const DEFAULT_MAP_STYLE = MAP_STYLE_URLS[0] ?? 'https://demotiles.maplibre.org/style.json';
