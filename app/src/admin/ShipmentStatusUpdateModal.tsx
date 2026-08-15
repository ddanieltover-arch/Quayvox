import { useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';
import type { Shipment } from '@/data/mockShipments';
import type { ShipmentWithExtras } from '@/lib/shipments';

const statuses: Shipment['status'][] = [
  'Pending',
  'In Transit',
  'Customs',
  'On Hold',
  'Delivered',
  'Exception',
];

const fieldClass =
  'w-full min-h-11 px-3 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cobalt/50';

function formFromShipment(shipment: ShipmentWithExtras) {
  return {
    status: shipment.status,
    progress: shipment.progress,
    eta: shipment.eta?.slice(0, 10) || '',
    currentAddress: shipment.currentAddress || '',
    eventMessage: '',
  };
}

type StatusForm = ReturnType<typeof formFromShipment>;

interface ShipmentStatusUpdateModalProps {
  shipment: ShipmentWithExtras | null;
  onClose: () => void;
}

export function ShipmentStatusUpdateModal({
  shipment,
  onClose,
}: ShipmentStatusUpdateModalProps) {
  const { updateShipment } = useShipments();
  const [form, setForm] = useState<StatusForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (shipment) setForm(formFromShipment(shipment));
    else setForm(null);
  }, [shipment]);

  if (!shipment || !form) return null;

  const setField = <K extends keyof StatusForm>(key: K, value: StatusForm[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    setSaving(true);

    const nextAddress = form.currentAddress.trim();
    const statusChanged = form.status !== shipment.status;
    const addressChanged = nextAddress !== (shipment.currentAddress ?? '').trim();
    const etaChanged = (form.eta || '') !== (shipment.eta?.slice(0, 10) || '');
    const progressChanged = form.progress !== shipment.progress;
    const customMessage = form.eventMessage.trim();

    const ok = await updateShipment(
      shipment.id,
      {
        status: form.status,
        progress: form.progress,
        eta: form.eta || '',
        currentAddress: nextAddress || null,
      },
      {
        eventMessage:
          customMessage ||
          (statusChanged
            ? `Status updated to ${form.status}`
            : addressChanged
              ? 'Location updated'
              : etaChanged
                ? 'ETA updated'
                : progressChanged
                  ? `Progress updated to ${form.progress}%`
                  : 'Shipment status updated'),
        eventLocation: addressChanged ? nextAddress : undefined,
      }
    );

    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg card-surface rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-lg text-text-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cobalt" />
              Update status
            </h2>
            <p className="text-xs font-mono text-cobalt mt-1">{shipment.trackingNumber}</p>
            <p className="text-xs text-text-secondary mt-0.5">
              {shipment.origin} → {shipment.destination}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-text-secondary"
            aria-label="Close"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setField('status', e.target.value as Shipment['status'])}
              className={fieldClass}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
              Progress ({form.progress}%)
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => setField('progress', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
              ETA
            </label>
            <input
              type="date"
              value={form.eta}
              onChange={(e) => setField('eta', e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
              Current address
            </label>
            <textarea
              value={form.currentAddress}
              onChange={(e) => setField('currentAddress', e.target.value)}
              rows={3}
              className={`${fieldClass} resize-y`}
              placeholder="e.g. Port of Los Angeles, Berth 302, San Pedro, CA 90731, USA"
            />
            <p className="text-xs text-text-secondary">
              This address is geocoded and pinned on the live tracking map.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
              Tracking update message (optional)
            </label>
            <input
              type="text"
              value={form.eventMessage}
              onChange={(e) => setField('eventMessage', e.target.value)}
              className={fieldClass}
              placeholder="e.g. Cleared customs, departing terminal"
            />
          </div>

          <p className="text-xs text-text-secondary">
            Every save emails the admin, sender, and receiver when their addresses are on file
            (Pending, In Transit, Customs, On Hold, Delivered, and Exception each use matching copy).
          </p>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-secondary flex-1 min-h-11"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="btn-primary flex-1 min-h-11 disabled:opacity-60"
            >
              {saving ? 'Updating…' : 'Update shipment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
