import { useEffect, useState } from 'react';
import { Plane, Ship, Train, Truck, Trash2, X } from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';
import type { Shipment } from '@/data/mockShipments';
import type { ShipmentWithExtras } from '@/lib/shipments';
import { QUAYVOX_CARRIER } from '@/lib/shipmentConstants';

const statuses: Shipment['status'][] = [
  'Pending',
  'In Transit',
  'Customs',
  'On Hold',
  'Delivered',
  'Exception',
];

const modeIcons = { Air: Plane, Ocean: Ship, Rail: Train, Road: Truck };

const fieldClass =
  'w-full min-h-11 px-3 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cobalt/50';

function formFromShipment(shipment: ShipmentWithExtras) {
  return {
    status: shipment.status,
    progress: shipment.progress,
    eta: shipment.eta?.slice(0, 10) || '',
    notes: shipment.notes || '',
    itemName: shipment.itemName || '',
    currentAddress: shipment.currentAddress || '',
    senderName: shipment.senderName || shipment.shipper || '',
    senderPhone: shipment.senderPhone || '',
    senderEmail: shipment.senderEmail || '',
    senderAddress: shipment.senderAddress || shipment.origin || '',
    receiverName: shipment.receiverName || shipment.consignee || '',
    receiverPhone: shipment.receiverPhone || '',
    receiverEmail: shipment.receiverEmail || shipment.customerEmail || '',
    receiverAddress: shipment.receiverAddress || shipment.destination || '',
    mode: shipment.mode,
    priority: shipment.priority,
    weight: String(shipment.weight || ''),
    volume: String(shipment.volume ?? ''),
    length: String(shipment.dimensions?.l ?? ''),
    width: String(shipment.dimensions?.w ?? ''),
    height: String(shipment.dimensions?.h ?? ''),
    paymentMethod: shipment.paymentMethod || '',
  };
}

type EditForm = ReturnType<typeof formFromShipment>;

interface ShipmentEditModalProps {
  shipment: ShipmentWithExtras | null;
  onClose: () => void;
}

export function ShipmentEditModal({ shipment, onClose }: ShipmentEditModalProps) {
  const { updateShipment, deleteShipment } = useShipments();
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (shipment) setForm(formFromShipment(shipment));
    else setForm(null);
  }, [shipment]);

  if (!shipment || !form) return null;

  const setField = <K extends keyof EditForm>(key: K, value: EditForm[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    setSaving(true);
    const senderAddress = form.senderAddress.trim();
    const receiverAddress = form.receiverAddress.trim();
    const receiverEmail = form.receiverEmail.trim();

    const updates: Parameters<typeof updateShipment>[1] = {
      status: form.status,
      progress: form.progress,
      eta: form.eta || '',
      notes: form.notes.trim() || null,
      itemName: form.itemName.trim(),
      currentAddress: form.currentAddress.trim() || null,
      origin: senderAddress,
      destination: receiverAddress,
      senderName: form.senderName.trim(),
      senderPhone: form.senderPhone.trim(),
      senderEmail: form.senderEmail.trim() || null,
      senderAddress,
      receiverName: form.receiverName.trim(),
      receiverPhone: form.receiverPhone.trim(),
      receiverEmail,
      receiverAddress,
      customerEmail: receiverEmail || null,
      shipper: form.senderName.trim(),
      consignee: form.receiverName.trim(),
      mode: form.mode,
      priority: form.priority,
      weight: Number(form.weight) || 0,
      volume: Number(form.volume) || 0,
      paymentMethod: form.paymentMethod.trim(),
      dimensions: {
        l: Number(form.length) || 0,
        w: Number(form.width) || 0,
        h: Number(form.height) || 0,
      },
    };

    const statusChanged = form.status !== shipment.status;
    const addressChanged =
      form.currentAddress.trim() !== (shipment.currentAddress ?? '').trim();
    const etaChanged = (form.eta || '') !== (shipment.eta?.slice(0, 10) || '');

    const ok = await updateShipment(shipment.id, updates, {
      eventMessage: statusChanged
        ? `Status updated to ${form.status}`
        : addressChanged
          ? 'Location updated'
          : etaChanged
            ? 'ETA updated'
            : 'Shipment details updated',
      eventLocation: addressChanged ? form.currentAddress.trim() : undefined,
    });

    setSaving(false);
    if (ok) onClose();
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete shipment ${shipment.trackingNumber}? This cannot be undone.`
      )
    ) {
      return;
    }
    setDeleting(true);
    const ok = await deleteShipment(shipment.id);
    setDeleting(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl card-surface rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-lg text-text-primary">Edit shipment</h2>
            <p className="text-xs font-mono text-cobalt mt-1">{shipment.trackingNumber}</p>
            <p className="text-xs text-text-secondary mt-0.5">Carrier: {QUAYVOX_CARRIER}</p>
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

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-cobalt">Status & progress</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value as Shipment['status'])}
                  className={fieldClass}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-2">ETA</label>
                <input type="date" value={form.eta} onChange={(e) => setField('eta', e.target.value)} className={fieldClass} />
              </div>
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
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-cobalt">Sender</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Sender name" value={form.senderName} onChange={(e) => setField('senderName', e.target.value)} className={fieldClass} />
              <input placeholder="Sender phone" value={form.senderPhone} onChange={(e) => setField('senderPhone', e.target.value)} className={fieldClass} />
              <input type="email" placeholder="Sender email" value={form.senderEmail} onChange={(e) => setField('senderEmail', e.target.value)} className={`${fieldClass} sm:col-span-2`} />
              <textarea placeholder="Sender address" value={form.senderAddress} onChange={(e) => setField('senderAddress', e.target.value)} rows={2} className={`${fieldClass} sm:col-span-2 resize-y`} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-cobalt">Receiver</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Receiver name" value={form.receiverName} onChange={(e) => setField('receiverName', e.target.value)} className={fieldClass} />
              <input placeholder="Receiver phone" value={form.receiverPhone} onChange={(e) => setField('receiverPhone', e.target.value)} className={fieldClass} />
              <input type="email" placeholder="Receiver email" value={form.receiverEmail} onChange={(e) => setField('receiverEmail', e.target.value)} className={`${fieldClass} sm:col-span-2`} />
              <textarea placeholder="Receiver address" value={form.receiverAddress} onChange={(e) => setField('receiverAddress', e.target.value)} rows={2} className={`${fieldClass} sm:col-span-2 resize-y`} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-cobalt">Freight</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <input type="number" placeholder="Weight (kg)" value={form.weight} onChange={(e) => setField('weight', e.target.value)} className={fieldClass} />
              <input type="number" placeholder="Volume" value={form.volume} onChange={(e) => setField('volume', e.target.value)} className={fieldClass} />
              <input placeholder="Payment method" value={form.paymentMethod} onChange={(e) => setField('paymentMethod', e.target.value)} className={fieldClass} />
              <input type="number" placeholder="Length" value={form.length} onChange={(e) => setField('length', e.target.value)} className={fieldClass} />
              <input type="number" placeholder="Width" value={form.width} onChange={(e) => setField('width', e.target.value)} className={fieldClass} />
              <input type="number" placeholder="Height" value={form.height} onChange={(e) => setField('height', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-text-secondary mb-2">Transport mode</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Ocean', 'Air', 'Rail', 'Road'] as const).map((mode) => {
                  const Icon = modeIcons[mode];
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setField('mode', mode)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs ${
                        form.mode === mode
                          ? 'bg-cobalt/20 border-cobalt/40 text-cobalt'
                          : 'bg-navy-900 border-white/5 text-text-secondary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-text-secondary mb-2">Priority</label>
              <div className="flex gap-2">
                {(['Express', 'Standard', 'Economy'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setField('priority', p)}
                    className={`flex-1 py-2 rounded-xl text-sm ${
                      form.priority === p ? 'bg-cobalt text-white' : 'bg-navy-900 text-text-secondary border border-white/5'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-cobalt">Tracking & notes</h3>
            <div>
              <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
                Item / cargo name
              </label>
              <input
                placeholder="e.g., Electronics components"
                value={form.itemName}
                onChange={(e) => setField('itemName', e.target.value)}
                className={fieldClass}
              />
            </div>
            <textarea
              placeholder="Current address"
              value={form.currentAddress}
              onChange={(e) => setField('currentAddress', e.target.value)}
              rows={2}
              className={`${fieldClass} resize-y`}
            />
            <p className="text-xs text-text-secondary">
              Current address is geocoded and pinned on the live tracking map.
            </p>
            <textarea
              placeholder="Description / notes"
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={3}
              className={`${fieldClass} resize-y`}
            />
            <p className="text-xs text-text-secondary">
              Every save emails admin, sender, and receiver when emails are on file.
            </p>
          </section>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={saving || deleting}
              className="btn-secondary flex items-center justify-center gap-2 min-h-11 text-red-400 border-red-500/30 hover:bg-red-500/10 disabled:opacity-60 sm:order-first"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
            <button type="button" onClick={onClose} disabled={saving || deleting} className="btn-secondary flex-1 min-h-11">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || deleting}
              className="btn-primary flex-1 min-h-11 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
