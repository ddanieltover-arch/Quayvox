import { useMemo } from 'react';
import { Brain, TrendingUp, Clock, Shield, Zap } from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Predictions = () => {
  const { shipments } = useShipments();

  const delayRisk = useMemo(() => {
    return shipments.map(s => ({
      tracking: s.trackingNumber,
      risk: s.progress < 30 ? Math.random() * 30 + 10 : s.progress > 80 ? Math.random() * 10 : Math.random() * 20 + 5,
      eta: s.eta,
      origin: s.origin,
      destination: s.destination,
    }));
  }, [shipments]);

  const demandForecast = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`,
      predicted: Math.round(150 + Math.sin(i * 0.3) * 50 + Math.random() * 20),
      actual: i < 15 ? Math.round(150 + Math.sin(i * 0.3) * 50 + Math.random() * 20) : null,
    }));
  }, []);

  const insights = [
    { icon: TrendingUp, title: 'Peak Season Alert', desc: 'Expect 40% volume increase in Q4', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: Shield, title: 'Route Optimization', desc: 'Switch 15% of ocean freight to rail for cost savings', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Zap, title: 'Carrier Performance', desc: 'DHL Express showing 12% faster delivery times', color: 'text-cobalt', bg: 'bg-cobalt/10' },
    { icon: Clock, title: 'Port Congestion', desc: 'Rotterdam port delays averaging +2.3 days', color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-text-primary">AI Predictions</h1>
        <p className="text-sm text-text-secondary mt-1">Machine learning-powered logistics insights</p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map(insight => (
          <div key={insight.title} className="card-surface p-5">
            <div className={`w-10 h-10 rounded-xl ${insight.bg} flex items-center justify-center mb-3`}>
              <insight.icon className={`w-5 h-5 ${insight.color}`} />
            </div>
            <h3 className="font-display font-semibold text-sm text-text-primary mb-1">{insight.title}</h3>
            <p className="text-xs text-text-secondary">{insight.desc}</p>
          </div>
        ))}
      </div>

      {/* Demand Forecast */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-text-primary">Demand Forecast (30 Days)</h3>
          <span className="text-xs text-text-secondary flex items-center gap-1">
            <Brain className="w-3 h-3" />
            AI-powered
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={demandForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#A7B1C8" fontSize={10} />
            <YAxis stroke="#A7B1C8" fontSize={10} />
            <Tooltip contentStyle={{ background: '#11182B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
            <Line type="monotone" dataKey="actual" stroke="#4F6DF5" strokeWidth={2} dot={false} name="Actual" />
            <Line type="monotone" dataKey="predicted" stroke="#27C26A" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Predicted" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-cobalt" />
            <span className="text-xs text-text-secondary">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-emerald-400 border-dashed" style={{ borderTop: '2px dashed #27C26A' }} />
            <span className="text-xs text-text-secondary">Predicted</span>
          </div>
        </div>
      </div>

      {/* Delay Risk Table */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-text-primary">Delay Risk Assessment</h3>
          <span className="text-xs text-text-secondary">Real-time analysis</span>
        </div>
        <div className="space-y-3">
          {delayRisk.sort((a, b) => b.risk - a.risk).map(item => (
            <div key={item.tracking} className="flex items-center gap-4 p-3 rounded-xl bg-navy-900/60 border border-white/5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-cobalt">{item.tracking}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    item.risk > 25 ? 'bg-red-500/20 text-red-400' :
                    item.risk > 15 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {item.risk > 25 ? 'High Risk' : item.risk > 15 ? 'Medium Risk' : 'Low Risk'}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">{item.origin} → {item.destination}</p>
              </div>
              <div className="w-32">
                <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    item.risk > 25 ? 'bg-red-500' : item.risk > 15 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} style={{ width: `${item.risk}%` }} />
                </div>
                <p className="text-[10px] text-text-secondary mt-1 text-right">{item.risk.toFixed(1)}% risk</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Predictions;
