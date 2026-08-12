/** Known city/port coordinates for auto-filling shipment geo fields. */

export type GeoCoord = [lat: number, lng: number];

export const PORT_COORDINATES: Record<string, GeoCoord> = {
  'Shanghai, CN': [31.2, 121.5],
  'Rotterdam, NL': [51.9, 4.5],
  'Singapore, SG': [1.3, 103.8],
  'Hamburg, DE': [53.5, 9.9],
  'Tokyo, JP': [35.7, 139.7],
  'Mumbai, IN': [19.1, 72.9],
  'Sao Paulo, BR': [-23.5, -46.6],
  'Busan, KR': [35.2, 129.1],
  'Melbourne, AU': [-37.8, 144.9],
  'Dubai, AE': [25.2, 55.3],
  'Los Angeles, US': [34.1, -118.2],
  'New York, US': [40.7, -74.0],
  'Sydney, AU': [-33.9, 151.2],
  'London, UK': [51.5, -0.1],
  'Nairobi, KE': [-1.3, 36.8],
  'Miami, US': [25.8, -80.2],
  'Auckland, NZ': [-36.8, 174.8],
  'Lagos, NG': [6.5, 3.4],
};

export function lookupPortCoords(place: string): GeoCoord | null {
  const trimmed = place.trim();
  if (!trimmed) return null;
  if (PORT_COORDINATES[trimmed]) return PORT_COORDINATES[trimmed];
  const key = Object.keys(PORT_COORDINATES).find(
    (k) => k.toLowerCase() === trimmed.toLowerCase()
  );
  return key ? PORT_COORDINATES[key] : null;
}

export function interpolateCoords(
  origin: GeoCoord,
  destination: GeoCoord,
  progress: number
): GeoCoord {
  const t = Math.min(100, Math.max(0, progress)) / 100;
  return [origin[0] + (destination[0] - origin[0]) * t, origin[1] + (destination[1] - origin[1]) * t];
}
