import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Clock, Search } from 'lucide-react';
import { getStatusColor } from '@/data/mockShipments';
import { ShipmentMap, shipmentHasMapGeo } from '@/components/tracking/ShipmentMap';
import { MapErrorBoundary } from '@/components/tracking/MapErrorBoundary';
import { MapLayersControl, useMapLayerPrefs } from '@/components/tracking/MapTypeSheet';
import { ShipmentDetailsDialog } from '@/components/tracking/ShipmentDetailsDialog';
import { useTrackPolling } from '@/hooks/useTrackPolling';
import { mapStopsFromEvents } from '@/lib/shipments';

const TrackResult = () => {
  const { trackingNumber = '' } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(trackingNumber);
  const {
    mapType,
    setMapType,
    satelliteLabels,
    setSatelliteLabels,
    showPorts,
    setShowPorts,
    layersOpen,
    setLayersOpen,
  } = useMapLayerPrefs(false);

  useEffect(() => {
    setQuery(trackingNumber);
  }, [trackingNumber]);

  const { shipment, events, positions, loading, notFound, error, lastFetchedAt } = useTrackPolling(
    trackingNumber,
    { enabled: Boolean(trackingNumber.trim()) }
  );

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = query.trim();
    if (next) navigate(`/track/${encodeURIComponent(next)}`);
  };

  const mapShipment = shipment
    ? {
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        progress: shipment.progress,
        origin: shipment.origin,
        destination: shipment.destination,
        originLat: shipment.originLat,
        originLng: shipment.originLng,
        destinationLat: shipment.destinationLat,
        destinationLng: shipment.destinationLng,
        currentLat: shipment.currentLat,
        currentLng: shipment.currentLng,
        currentAddress: shipment.currentAddress,
        mode: shipment.mode,
        itemName: shipment.itemName,
        alertMessage:
          shipment.status === 'On Hold'
            ? [...events].reverse().find((event) => event.status === 'On Hold' && event.message?.trim())
                ?.message ||
              [...events].reverse().find((event) => event.message?.trim())?.message ||
              shipment.notes ||
              undefined
            : undefined,
        positions,
        stops: mapStopsFromEvents(events),
      }
    : null;

  const hasMapGeo = mapShipment ? shipmentHasMapGeo(mapShipment) : false;

  return (
    <div className="pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-3xl mx-auto pb-[max(2rem,env(safe-area-inset-bottom))]">
      <Link
        to="/track"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Track another shipment
      </Link>

      <h1 className="font-display font-bold text-2xl sm:text-3xl text-text-primary mb-2">
        Track shipment
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        Enter a tracking number to view live status, map, and timeline.
        {lastFetchedAt ? (
          <span className="block mt-1 text-xs">
            Live · updated {new Date(lastFetchedAt).toLocaleTimeString()}
          </span>
        ) : null}
      </p>

      <form onSubmit={onSearch} className="glass-card p-2 flex flex-col sm:flex-row gap-2 mb-8">
        <div className="flex items-center gap-2 flex-1 px-3 min-h-11">
          <Search className="w-5 h-5 text-text-secondary shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. SH-2026-7842"
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary/50 text-sm outline-none min-w-0"
          />
        </div>
        <button type="submit" className="btn-primary min-h-11 px-5 text-sm w-full sm:w-auto">
          Track
        </button>
      </form>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="card-surface p-6 text-sm text-red-300 border border-red-500/20">{error}</div>
      )}

      {!loading && notFound && !error && (
        <div className="card-surface p-6 sm:p-8 text-center space-y-3">
          <Package className="w-10 h-10 text-text-secondary mx-auto" />
          <h2 className="font-display font-semibold text-xl text-text-primary">No shipment found</h2>
          <p className="text-sm text-text-secondary">
            We couldn&apos;t find <span className="font-mono text-cobalt">{trackingNumber}</span>.
            Check the number and try again. Demo: <span className="font-mono">SH-2026-7842</span>
          </p>
        </div>
      )}

      {!loading && shipment && (
        <div className="space-y-6">
          <div className="card-surface p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-mono uppercase text-text-secondary mb-1">Tracking</p>
                <p className="font-mono text-lg text-cobalt">{shipment.trackingNumber}</p>
              </div>
              <span
                className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(shipment.status)}`}
              >
                {shipment.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-cobalt shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary">Origin</p>
                  <p className="text-sm text-text-primary">{shipment.origin}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-cobalt shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary">Destination</p>
                  <p className="text-sm text-text-primary">{shipment.destination}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Package className="w-5 h-5 text-cobalt shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary">Carrier · Mode</p>
                  <p className="text-sm text-text-primary">
                    {shipment.carrier} · {shipment.mode}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-cobalt shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-text-secondary">ETA</p>
                  <p className="text-sm text-text-primary">{shipment.eta || '—'}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">Progress</span>
                <span className="text-xs font-mono text-text-secondary">{shipment.progress}%</span>
              </div>
              <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cobalt rounded-full transition-all"
                  style={{ width: `${shipment.progress}%` }}
                />
              </div>
            </div>
          </div>

          <ShipmentDetailsDialog shipment={shipment} />

          <div className="card-surface p-0 overflow-hidden">
            <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center justify-between gap-2">
              <h2 className="font-display font-semibold text-lg text-text-primary">Live map</h2>
              {shipment.currentLocationUpdatedAt && (
                <p className="text-xs text-text-secondary">
                  Position {new Date(shipment.currentLocationUpdatedAt).toLocaleString()}
                </p>
              )}
            </div>
            {hasMapGeo && mapShipment ? (
              <div className="relative mx-5 sm:mx-6 mb-5 sm:mb-6">
                <MapErrorBoundary resetKey={`${mapType}-${satelliteLabels}`}>
                  <ShipmentMap
                    key={mapType}
                    shipments={[mapShipment]}
                    showPorts={showPorts}
                    basemap={mapType}
                    satelliteLabels={satelliteLabels}
                    className="h-64 sm:h-80"
                  />
                </MapErrorBoundary>
                <MapLayersControl
                  mapType={mapType}
                  onMapTypeChange={setMapType}
                  satelliteLabels={satelliteLabels}
                  onSatelliteLabelsChange={setSatelliteLabels}
                  showPorts={showPorts}
                  onShowPortsChange={setShowPorts}
                  layersOpen={layersOpen}
                  onLayersOpenChange={setLayersOpen}
                />
              </div>
            ) : (
              <p className="px-5 sm:px-6 pb-5 text-sm text-text-secondary">
                Map appears once the shipment has a locatable origin, destination, or current address.
              </p>
            )}
          </div>

          <div className="card-surface p-5 sm:p-6">
            <h2 className="font-display font-semibold text-lg text-text-primary mb-4">Timeline</h2>
            {events.length === 0 ? (
              <p className="text-sm text-text-secondary">No events recorded yet.</p>
            ) : (
              <ol className="relative border-l border-white/10 ml-2 space-y-5">
                {events.map((event) => (
                  <li key={event.id} className="pl-5 relative">
                    <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-cobalt border-2 border-navy-900" />
                    <p className="text-sm text-text-primary">{event.message}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {[event.status, event.location].filter(Boolean).join(' · ')}
                      {event.occurredAt ? ` · ${new Date(event.occurredAt).toLocaleString()}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackResult;
