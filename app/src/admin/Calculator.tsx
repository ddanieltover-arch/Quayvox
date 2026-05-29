import { useState } from 'react';
import { Calculator as CalcIcon, Plane, Ship, Train, Truck } from 'lucide-react';

const carriers = [
  { name: 'DHL Express', air: 12.5, ocean: 2.1, rail: 4.2, road: 6.8, time: { air: '2-3d', ocean: '15-25d', rail: '12-18d', road: '5-10d' } },
  { name: 'FedEx', air: 11.8, ocean: 1.9, rail: 3.8, road: 6.2, time: { air: '2-4d', ocean: '18-28d', rail: '14-20d', road: '6-12d' } },
  { name: 'Maersk', air: 14.2, ocean: 1.5, rail: 4.5, road: 7.5, time: { air: '3-5d', ocean: '12-22d', rail: '10-16d', road: '4-8d' } },
  { name: 'DB Schenker', air: 13.0, ocean: 1.8, rail: 3.5, road: 5.8, time: { air: '2-4d', ocean: '16-26d', rail: '11-17d', road: '5-9d' } },
];

const Calculator = () => {
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState({ l: '', w: '', h: '' });
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState<'Air' | 'Ocean' | 'Rail' | 'Road'>('Ocean');
  const [showResults, setShowResults] = useState(false);

  const modeIcons = { Air: Plane, Ocean: Ship, Rail: Train, Road: Truck };

  const calculate = () => {
    setShowResults(true);
  };

  const volumetricWeight = (Number(dimensions.l) * Number(dimensions.w) * Number(dimensions.h)) / 5000;
  const chargeableWeight = Math.max(Number(weight), volumetricWeight || 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl text-text-primary">Cost Calculator</h1>
        <p className="text-sm text-text-secondary mt-1">Get instant shipping cost estimates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="font-display font-semibold text-text-primary">Shipment Details</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1.5">ORIGIN</label>
              <input type="text" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="City, Country"
                className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
            </div>
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1.5">DESTINATION</label>
              <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="City, Country"
                className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1.5">WEIGHT (KG)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 1000"
              className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
          </div>

          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1.5">DIMENSIONS (L × W × H cm)</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" value={dimensions.l} onChange={e => setDimensions(p => ({ ...p, l: e.target.value }))} placeholder="L"
                className="px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
              <input type="number" value={dimensions.w} onChange={e => setDimensions(p => ({ ...p, w: e.target.value }))} placeholder="W"
                className="px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
              <input type="number" value={dimensions.h} onChange={e => setDimensions(p => ({ ...p, h: e.target.value }))} placeholder="H"
                className="px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1.5">TRANSPORT MODE</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Ocean', 'Air', 'Rail', 'Road'] as const).map(m => {
                const Icon = modeIcons[m];
                return (
                  <button key={m} onClick={() => { setMode(m); setShowResults(false); }}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${mode === m ? 'bg-cobalt/20 border-cobalt/40 text-cobalt' : 'bg-navy-900 border-white/5 text-text-secondary'}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-mono">{m}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={calculate} className="w-full btn-primary flex items-center justify-center gap-2">
            <CalcIcon className="w-4 h-4" />
            Calculate Cost
          </button>
        </div>

        {/* Results */}
        {showResults && chargeableWeight > 0 && (
          <div className="space-y-4">
            <div className="card-surface p-6">
              <h3 className="font-display font-semibold text-text-primary mb-4">Quote Comparison</h3>
              <div className="space-y-3">
                {carriers.map(carrier => {
                  const rate = carrier[mode.toLowerCase() as keyof typeof carrier] as number;
                  const cost = Math.round(chargeableWeight * rate);
                  const time = (carrier.time as Record<string, string>)[mode.toLowerCase()];
                  return (
                    <div key={carrier.name} className="flex items-center justify-between p-4 rounded-xl bg-navy-900/60 border border-white/5">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{carrier.name}</p>
                        <p className="text-xs text-text-secondary">Est. {time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-display font-bold text-cobalt">${cost.toLocaleString()}</p>
                        <p className="text-xs text-text-secondary">${rate}/kg</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card-surface p-6">
              <h3 className="font-display font-semibold text-text-primary mb-3">Calculation Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Actual Weight</span>
                  <span>{weight} kg</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Volumetric Weight</span>
                  <span>{volumetricWeight.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between text-cobalt font-medium">
                  <span>Chargeable Weight</span>
                  <span>{chargeableWeight.toFixed(1)} kg</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between text-text-primary font-medium">
                  <span>Best Rate ({carriers.sort((a, b) => (a[mode.toLowerCase() as keyof typeof a] as number) - (b[mode.toLowerCase() as keyof typeof b] as number))[0].name})</span>
                  <span>${Math.round(chargeableWeight * (carriers.sort((a, b) => (a[mode.toLowerCase() as keyof typeof a] as number) - (b[mode.toLowerCase() as keyof typeof b] as number))[0][mode.toLowerCase() as keyof typeof carriers[0]] as number)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;
