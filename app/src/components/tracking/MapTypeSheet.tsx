import { useEffect, useState } from 'react';
import { Layers, X } from 'lucide-react';
import { isMapBasemapId, MAP_BASEMAPS, MAP_BASEMAP_IDS, type MapBasemapId } from '@/lib/mapConfig';
import { cn } from '@/lib/utils';

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

export function useMapLayerPrefs(defaultShowPorts = false) {
  const [mapType, setMapType] = useState<MapBasemapId>(() => readStoredBasemap());
  const [satelliteLabels, setSatelliteLabels] = useState(() => readStoredFlag(MAP_LABELS_KEY, true));
  const [showPorts, setShowPorts] = useState(() => readStoredFlag(MAP_PORTS_KEY, defaultShowPorts));
  const [layersOpen, setLayersOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(MAP_TYPE_KEY, mapType);
      localStorage.setItem(MAP_LABELS_KEY, satelliteLabels ? '1' : '0');
      localStorage.setItem(MAP_PORTS_KEY, showPorts ? '1' : '0');
    } catch {
      /* ignore quota / private mode */
    }
  }, [mapType, satelliteLabels, showPorts]);

  return {
    mapType,
    setMapType,
    satelliteLabels,
    setSatelliteLabels,
    showPorts,
    setShowPorts,
    layersOpen,
    setLayersOpen,
  };
}

export function MapLayersControl({
  mapType,
  onMapTypeChange,
  satelliteLabels,
  onSatelliteLabelsChange,
  showPorts,
  onShowPortsChange,
  layersOpen,
  onLayersOpenChange,
}: {
  mapType: MapBasemapId;
  onMapTypeChange: (id: MapBasemapId) => void;
  satelliteLabels: boolean;
  onSatelliteLabelsChange: (value: boolean) => void;
  showPorts: boolean;
  onShowPortsChange: (value: boolean) => void;
  layersOpen: boolean;
  onLayersOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onLayersOpenChange(true)}
        className="absolute top-3 right-3 z-[1000] flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-navy-800 px-3 text-sm font-medium text-text-primary shadow-lg hover:border-cobalt/50"
        aria-label="Map type and layers"
      >
        <Layers className="w-4 h-4 text-cobalt" />
        Map type
      </button>
      {layersOpen ? (
        <MapTypeSheet
          open
          onOpenChange={onLayersOpenChange}
          mapType={mapType}
          onMapTypeChange={onMapTypeChange}
          satelliteLabels={satelliteLabels}
          onSatelliteLabelsChange={onSatelliteLabelsChange}
          showPorts={showPorts}
          onShowPortsChange={onShowPortsChange}
        />
      ) : null}
    </>
  );
}

const PREVIEW: Record<MapBasemapId, string> = {
  default:
    'radial-gradient(circle at 30% 20%, #2a3558 0%, #0B1020 55%), linear-gradient(180deg, #1a2240 0%, #0B1020 100%)',
  satellite:
    'radial-gradient(circle at 40% 35%, #3d7a4a 0%, #1a4a32 40%, #0e2a28 70%), linear-gradient(160deg, #1e4d6b 0%, #2d5a28 55%, #3a2e18 100%)',
  terrain:
    'linear-gradient(180deg, #dce8c8 0%, #f4f1e8 40%, #ffffff 70%, #c8e0b0 100%)',
};

export interface MapTypeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapType: MapBasemapId;
  onMapTypeChange: (id: MapBasemapId) => void;
  satelliteLabels: boolean;
  onSatelliteLabelsChange: (value: boolean) => void;
  showPorts: boolean;
  onShowPortsChange: (value: boolean) => void;
}

function DetailToggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex min-h-11 w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-colors',
        disabled && 'cursor-not-allowed opacity-40',
        checked && !disabled
          ? 'border-cobalt/50 bg-cobalt/15 text-text-primary'
          : 'border-white/10 bg-navy-900/40 text-text-secondary'
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked && !disabled ? 'bg-cobalt' : 'bg-white/15'
        )}
        aria-hidden
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
            checked && !disabled ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </span>
    </button>
  );
}

export function MapTypeSheet({
  open,
  onOpenChange,
  mapType,
  onMapTypeChange,
  satelliteLabels,
  onSatelliteLabelsChange,
  showPorts,
  onShowPortsChange,
}: MapTypeSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center sm:items-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close map type"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-labelledby="qv-map-type-title"
        className="relative z-[2001] w-full max-w-md rounded-t-[28px] border border-white/10 bg-navy-800 pb-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 p-4 pb-2">
          <div>
            <h2 id="qv-map-type-title" className="font-display text-lg font-semibold text-text-primary">
              Map type
            </h2>
            <p className="text-sm text-text-secondary">Choose a basemap and optional map details.</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-2 text-text-secondary hover:bg-white/5 hover:text-text-primary"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 px-4 pt-2">
          {MAP_BASEMAP_IDS.map((id) => {
            const selected = mapType === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onMapTypeChange(id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-[22px] p-1.5 transition-colors',
                  selected ? 'bg-cobalt/15' : 'hover:bg-white/5'
                )}
              >
                <span
                  className={cn(
                    'block aspect-square w-full rounded-[18px] border-2 shadow-inner',
                    selected ? 'border-cobalt' : 'border-white/10'
                  )}
                  style={{ background: PREVIEW[id] }}
                />
                <span
                  className={cn(
                    'text-xs font-medium',
                    selected ? 'text-cobalt' : 'text-text-secondary'
                  )}
                >
                  {MAP_BASEMAPS[id].label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-2 px-4">
          <p className="text-xs font-mono uppercase tracking-wide text-text-secondary">Map details</p>
          <DetailToggle
            label="Labels"
            checked={satelliteLabels}
            disabled={mapType !== 'satellite'}
            onChange={onSatelliteLabelsChange}
          />
          <DetailToggle label="Ports" checked={showPorts} onChange={onShowPortsChange} />
        </div>
      </div>
    </div>
  );
}
