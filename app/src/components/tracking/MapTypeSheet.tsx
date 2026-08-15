import { MAP_BASEMAPS, MAP_BASEMAP_IDS, type MapBasemapId } from '@/lib/mapConfig';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const PREVIEW: Record<MapBasemapId, string> = {
  default:
    'radial-gradient(circle at 30% 20%, #2a3558 0%, #0B1020 55%), linear-gradient(180deg, #1a2240 0%, #0B1020 100%)',
  satellite:
    'radial-gradient(circle at 40% 35%, #3d7a4a 0%, #1a4a32 40%, #0e2a28 70%), linear-gradient(160deg, #1e4d6b 0%, #2d5a28 55%, #3a2e18 100%)',
  terrain:
    'linear-gradient(180deg, #87a87a 0%, #5d8a4a 35%, #c4b896 70%, #6b8f5a 100%)',
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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="border-white/10 bg-navy-800 sm:mx-auto sm:max-w-md sm:rounded-t-[28px] gap-0 pb-6"
      >
        <SheetHeader className="pb-2">
          <SheetTitle className="font-display text-lg text-text-primary">Map type</SheetTitle>
          <SheetDescription className="text-text-secondary">
            Choose a basemap and optional map details.
          </SheetDescription>
        </SheetHeader>

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
      </SheetContent>
    </Sheet>
  );
}
