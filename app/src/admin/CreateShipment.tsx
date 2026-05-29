import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Plane, Ship, Train, Truck, MapPin, DollarSign, Package } from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';
import { useNavigate } from 'react-router-dom';

const steps = ['Origin & Destination', 'Details', 'Review'];

const CreateShipment = () => {
  const { addShipment } = useShipments();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    carrier: 'Maersk',
    mode: 'Ocean' as 'Air' | 'Ocean' | 'Rail' | 'Road',
    priority: 'Standard' as 'Express' | 'Standard' | 'Economy',
    weight: '',
    dimensions: { l: '', w: '', h: '' },
    shipper: '',
    consignee: '',
    tags: '',
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    addShipment({
      origin: form.origin,
      destination: form.destination,
      carrier: form.carrier,
      status: 'Pending',
      weight: Number(form.weight),
      dimensions: { l: Number(form.dimensions.l), w: Number(form.dimensions.w), h: Number(form.dimensions.h) },
      cost: Math.round(Number(form.weight) * 0.3 + Math.random() * 1000),
      eta: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      progress: 0,
      mode: form.mode,
      priority: form.priority,
      shipper: form.shipper,
      consignee: form.consignee,
      documents: [],
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    navigate('/admin/shipments');
  };

  const modeIcons = { Air: Plane, Ocean: Ship, Rail: Train, Road: Truck };
  const estimatedCost = form.weight ? Math.round(Number(form.weight) * 0.3 + 500) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-text-primary">Create Shipment</h1>
        <p className="text-sm text-text-secondary mt-1">Set up a new shipment in 3 easy steps</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              i < currentStep ? 'bg-emerald-500 text-white' :
              i === currentStep ? 'bg-cobalt text-white' :
              'bg-navy-800 text-text-secondary border border-white/10'
            }`}>
              {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs ${i <= currentStep ? 'text-text-primary' : 'text-text-secondary'}`}>{step}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-emerald-500' : 'bg-navy-700'}`} />}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="card-surface p-6">
        {currentStep === 0 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-lg text-text-primary">Route Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">ORIGIN</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    value={form.origin}
                    onChange={e => updateField('origin', e.target.value)}
                    placeholder="e.g. Shanghai, CN"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">DESTINATION</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    value={form.destination}
                    onChange={e => updateField('destination', e.target.value)}
                    placeholder="e.g. Los Angeles, US"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1.5">TRANSPORT MODE</label>
              <div className="grid grid-cols-4 gap-3">
                {(['Ocean', 'Air', 'Rail', 'Road'] as const).map(mode => {
                  const Icon = modeIcons[mode];
                  return (
                    <button
                      key={mode}
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
                {(['Express', 'Standard', 'Economy'] as const).map(p => (
                  <button
                    key={p}
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
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-lg text-text-primary">Shipment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">WEIGHT (KG)</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="number"
                    value={form.weight}
                    onChange={e => updateField('weight', e.target.value)}
                    placeholder="e.g. 12500"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">CARRIER</label>
                <select
                  value={form.carrier}
                  onChange={e => updateField('carrier', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary text-sm focus:outline-none focus:border-cobalt/50"
                >
                  {['Maersk', 'Hapag-Lloyd', 'DHL Express', 'DB Schenker', 'FedEx', 'Emirates SkyCargo'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1.5">DIMENSIONS (L × W × H meters)</label>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="Length" value={form.dimensions.l} onChange={e => setForm(p => ({ ...p, dimensions: { ...p.dimensions, l: e.target.value } }))}
                  className="px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
                <input type="number" placeholder="Width" value={form.dimensions.w} onChange={e => setForm(p => ({ ...p, dimensions: { ...p.dimensions, w: e.target.value } }))}
                  className="px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
                <input type="number" placeholder="Height" value={form.dimensions.h} onChange={e => setForm(p => ({ ...p, dimensions: { ...p.dimensions, h: e.target.value } }))}
                  className="px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">SHIPPER</label>
                <input type="text" value={form.shipper} onChange={e => updateField('shipper', e.target.value)} placeholder="Company name"
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
              </div>
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">CONSIGNEE</label>
                <input type="text" value={form.consignee} onChange={e => updateField('consignee', e.target.value)} placeholder="Company name"
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1.5">TAGS (comma separated)</label>
              <input type="text" value={form.tags} onChange={e => updateField('tags', e.target.value)} placeholder="electronics, priority, fragile"
                className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-lg text-text-primary">Review & Confirm</h3>
            <div className="space-y-3">
              {[
                { label: 'Route', value: `${form.origin} → ${form.destination}` },
                { label: 'Mode', value: form.mode },
                { label: 'Priority', value: form.priority },
                { label: 'Weight', value: `${form.weight} kg` },
                { label: 'Carrier', value: form.carrier },
                { label: 'Shipper', value: form.shipper },
                { label: 'Consignee', value: form.consignee },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-navy-900/60 border border-white/5">
                  <span className="text-xs font-mono text-text-secondary">{item.label}</span>
                  <span className="text-sm text-text-primary">{item.value || '—'}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-4 rounded-xl bg-cobalt/10 border border-cobalt/30">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-cobalt" />
                  <span className="text-sm font-medium text-text-primary">Estimated Cost</span>
                </div>
                <span className="text-xl font-display font-bold text-cobalt">${estimatedCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        {currentStep < 2 ? (
          <button onClick={() => setCurrentStep(s => s + 1)} className="btn-primary flex items-center gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
            <Check className="w-4 h-4" />
            Create Shipment
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateShipment;
