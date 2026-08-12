import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Plane, Ship, Train, Truck } from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { QUAYVOX_CARRIER } from '@/lib/shipmentConstants';

const steps = ['Sender & Receiver', 'Freight & Schedule', 'Review'];

const DEFAULT_CARRIER = QUAYVOX_CARRIER;

const inputClass =
  'w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50';

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const CreateShipment = () => {
  const { addShipment } = useShipments();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [currentAt] = useState(() => toLocalInputValue(new Date()));
  const [form, setForm] = useState({
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderAddress: '',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
    receiverAddress: '',
    departureAt: '',
    deliveryAt: '',
    weight: '',
    volume: '',
    length: '',
    width: '',
    height: '',
    paymentMethod: '',
    description: '',
    mode: 'Ocean' as 'Air' | 'Ocean' | 'Rail' | 'Road',
    priority: 'Standard' as 'Express' | 'Standard' | 'Economy',
    tags: '',
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    if (step === 0) {
      const required = [
        form.senderName,
        form.senderPhone,
        form.senderAddress,
        form.receiverName,
        form.receiverPhone,
        form.receiverEmail,
        form.receiverAddress,
      ];
      if (required.some((v) => !v.trim())) {
        toast.error('Fill all required sender and receiver fields');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.receiverEmail.trim())) {
        toast.error('Enter a valid receiver email');
        return false;
      }
      return true;
    }
    if (step === 1) {
      const required = [
        form.weight,
        form.volume,
        form.height,
        form.length,
        form.width,
        form.paymentMethod,
      ];
      if (required.some((v) => !String(v).trim())) {
        toast.error('Fill all required freight metric fields');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1)) {
      setCurrentStep(0);
      return;
    }

    const senderAddress = form.senderAddress.trim();
    const receiverAddress = form.receiverAddress.trim();
    const departureAt = fromLocalInputValue(form.departureAt);
    const deliveryAt = fromLocalInputValue(form.deliveryAt);
    const eta = deliveryAt ? deliveryAt.slice(0, 10) : new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

    setSubmitting(true);
    try {
      const created = await addShipment({
        origin: senderAddress,
        destination: receiverAddress,
        carrier: DEFAULT_CARRIER,
        status: 'Pending',
        weight: Number(form.weight),
        dimensions: {
          l: Number(form.length),
          w: Number(form.width),
          h: Number(form.height),
        },
        cost: Math.round(Number(form.weight) * 0.3 + Math.random() * 1000),
        eta,
        progress: 0,
        mode: form.mode,
        priority: form.priority,
        shipper: form.senderName.trim(),
        consignee: form.receiverName.trim(),
        documents: [],
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        customerEmail: form.receiverEmail.trim(),
        notes: form.description.trim() || null,
        senderName: form.senderName.trim(),
        senderPhone: form.senderPhone.trim(),
        senderEmail: form.senderEmail.trim() || null,
        senderAddress,
        receiverName: form.receiverName.trim(),
        receiverPhone: form.receiverPhone.trim(),
        receiverEmail: form.receiverEmail.trim(),
        receiverAddress,
        departureAt,
        deliveryAt,
        volume: Number(form.volume),
        paymentMethod: form.paymentMethod.trim(),
      });
      if (created) navigate('/admin/shipments');
    } finally {
      setSubmitting(false);
    }
  };

  const modeIcons = { Air: Plane, Ocean: Ship, Rail: Train, Road: Truck };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-text-primary">Create Shipment</h1>
        <p className="text-sm text-text-secondary mt-1">Capture party, schedule, and freight details</p>
      </div>

      <div className="flex items-center gap-4">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                i < currentStep
                  ? 'bg-emerald-500 text-white'
                  : i === currentStep
                    ? 'bg-cobalt text-white'
                    : 'bg-navy-800 text-text-secondary border border-white/10'
              }`}
            >
              {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs ${i <= currentStep ? 'text-text-primary' : 'text-text-secondary'}`}>
              {step}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-emerald-500' : 'bg-navy-700'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="card-surface p-6 space-y-8">
        {currentStep === 0 && (
          <>
            <section className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-text-primary">Sender Details (Origin)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">SENDER NAME*</label>
                  <input className={inputClass} value={form.senderName} onChange={(e) => updateField('senderName', e.target.value)} placeholder="e.g., John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">SENDER PHONE*</label>
                  <input className={inputClass} value={form.senderPhone} onChange={(e) => updateField('senderPhone', e.target.value)} placeholder="e.g., +1 234 567 8900" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">SENDER EMAIL</label>
                  <input type="email" className={inputClass} value={form.senderEmail} onChange={(e) => updateField('senderEmail', e.target.value)} placeholder="e.g., sender@example.com" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">SENDER ADDRESS*</label>
                  <textarea
                    rows={3}
                    className={`${inputClass} resize-y`}
                    value={form.senderAddress}
                    onChange={(e) => updateField('senderAddress', e.target.value)}
                    placeholder="e.g., 123 Origin Hub, Wroclaw, Lower Silesian 51-644, Poland"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-text-primary">Receiver Details (Destination)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">RECEIVER NAME*</label>
                  <input className={inputClass} value={form.receiverName} onChange={(e) => updateField('receiverName', e.target.value)} placeholder="e.g., Jane Smith" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">RECEIVER PHONE*</label>
                  <input className={inputClass} value={form.receiverPhone} onChange={(e) => updateField('receiverPhone', e.target.value)} placeholder="e.g., +44 20 7123 4567" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">RECEIVER EMAIL* (AUTO-ACCOUNT & ALERTS)</label>
                  <input type="email" className={inputClass} value={form.receiverEmail} onChange={(e) => updateField('receiverEmail', e.target.value)} placeholder="customer@example.com" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">RECEIVER ADDRESS*</label>
                  <textarea
                    rows={3}
                    className={`${inputClass} resize-y`}
                    value={form.receiverAddress}
                    onChange={(e) => updateField('receiverAddress', e.target.value)}
                    placeholder="e.g., 456 Destination Rd, London, England SW1A 1AA, UK"
                  />
                </div>
              </div>
            </section>
          </>
        )}

        {currentStep === 1 && (
          <>
            <section className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-text-primary">Time and Dates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">CURRENT TIME & DATE</label>
                  <input type="datetime-local" className={inputClass} value={currentAt} readOnly />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">DEPARTURE TIME & DATE</label>
                  <input type="datetime-local" className={inputClass} value={form.departureAt} onChange={(e) => updateField('departureAt', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">DELIVERY TIME & DATE</label>
                  <input type="datetime-local" className={inputClass} value={form.deliveryAt} onChange={(e) => updateField('deliveryAt', e.target.value)} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-text-primary">Freight Metrics & Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">WEIGHT (KG)*</label>
                  <input type="number" min="0" step="any" className={inputClass} value={form.weight} onChange={(e) => updateField('weight', e.target.value)} placeholder="e.g., 15.5" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">VOLUME*</label>
                  <input type="number" min="0" step="any" className={inputClass} value={form.volume} onChange={(e) => updateField('volume', e.target.value)} placeholder="e.g., 0.5" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">HEIGHT*</label>
                  <input type="number" min="0" step="any" className={inputClass} value={form.height} onChange={(e) => updateField('height', e.target.value)} placeholder="e.g., 10" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">LENGTH*</label>
                  <input type="number" min="0" step="any" className={inputClass} value={form.length} onChange={(e) => updateField('length', e.target.value)} placeholder="e.g., 20" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">WIDTH*</label>
                  <input type="number" min="0" step="any" className={inputClass} value={form.width} onChange={(e) => updateField('width', e.target.value)} placeholder="e.g., 15" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">PAYMENT METHOD*</label>
                  <input className={inputClass} value={form.paymentMethod} onChange={(e) => updateField('paymentMethod', e.target.value)} placeholder="e.g., Bank Transfer, Cash" />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-text-primary">Description Details</h3>
              <textarea
                rows={4}
                className={`${inputClass} resize-y`}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Additional details about the shipment"
              />
            </section>

            <section className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-text-primary">Transport</h3>
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">CARRIER</label>
                <div
                  className={`${inputClass} bg-navy-900/80 cursor-default border-cobalt/20 text-text-primary font-medium`}
                  aria-readonly="true"
                >
                  {DEFAULT_CARRIER}
                </div>
                <p className="text-xs text-text-secondary mt-1.5">All Quayvox shipments use this carrier.</p>
              </div>
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">TRANSPORT MODE</label>
                <div className="grid grid-cols-4 gap-3">
                  {(['Ocean', 'Air', 'Rail', 'Road'] as const).map((mode) => {
                    const Icon = modeIcons[mode];
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => updateField('mode', mode)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                          form.mode === mode
                            ? 'bg-cobalt/20 border-cobalt/40 text-cobalt'
                            : 'bg-navy-900 border-white/5 text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-mono">{mode}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">PRIORITY</label>
                <div className="flex gap-3">
                  {(['Express', 'Standard', 'Economy'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateField('priority', p)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        form.priority === p
                          ? 'bg-cobalt text-white'
                          : 'bg-navy-900 text-text-secondary border border-white/5 hover:text-text-primary'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">TAGS (comma separated)</label>
                <input
                  className={inputClass}
                  value={form.tags}
                  onChange={(e) => updateField('tags', e.target.value)}
                  placeholder="electronics, priority, fragile"
                />
              </div>
            </section>
          </>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-lg text-text-primary">Review & Confirm</h3>
            <div className="space-y-3">
              {[
                { label: 'Route', value: `${form.senderAddress || '—'} → ${form.receiverAddress || '—'}` },
                { label: 'Sender', value: `${form.senderName} · ${form.senderPhone}` },
                { label: 'Sender address', value: form.senderAddress },
                { label: 'Receiver', value: `${form.receiverName} · ${form.receiverPhone}` },
                { label: 'Receiver email', value: form.receiverEmail },
                { label: 'Receiver address', value: form.receiverAddress },
                { label: 'Departure', value: form.departureAt || '—' },
                { label: 'Delivery', value: form.deliveryAt || '—' },
                { label: 'Weight / Volume', value: `${form.weight} kg / ${form.volume}` },
                { label: 'Dimensions (L×W×H)', value: `${form.length} × ${form.width} × ${form.height}` },
                { label: 'Payment', value: form.paymentMethod },
                { label: 'Mode / Priority', value: `${form.mode} · ${form.priority}` },
                { label: 'Carrier', value: DEFAULT_CARRIER },
                { label: 'Description', value: form.description || '—' },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-navy-900/60 border border-white/5">
                  <span className="text-xs font-mono text-text-secondary shrink-0">{item.label}</span>
                  <span className="text-sm text-text-primary text-right">{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0 || submitting}
          className="btn-secondary flex items-center gap-2 disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        {currentStep < 2 ? (
          <button type="button" onClick={handleContinue} className="btn-primary flex items-center gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            <Check className="w-4 h-4" />
            {submitting ? 'Creating…' : 'Create Shipment'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateShipment;
