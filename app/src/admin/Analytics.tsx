import { useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { TrendingUp, Package, DollarSign, Clock } from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';

const COLORS = ['#4F6DF5', '#27C26A', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const Analytics = () => {
  const { shipments } = useShipments();
  const [dateRange, setDateRange] = useState('30d');

  const stats = useMemo(() => ({
    totalRevenue: shipments.reduce((s, sh) => s + sh.cost, 0),
    totalWeight: shipments.reduce((s, sh) => s + sh.weight, 0),
    avgDelivery: Math.round(shipments.filter(s => s.status === 'Delivered').length / shipments.length * 100),
    activeCount: shipments.filter(s => s.status === 'In Transit').length,
  }), [shipments]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    shipments.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [shipments]);

  const modeData = useMemo(() => {
    const counts: Record<string, number> = {};
    shipments.forEach(s => { counts[s.mode] = (counts[s.mode] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [shipments]);

  const costByMode = useMemo(() => {
    const costs: Record<string, number> = {};
    shipments.forEach(s => { costs[s.mode] = (costs[s.mode] || 0) + s.cost; });
    return Object.entries(costs).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [shipments]);

  const trendData = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      day: `Day ${i + 1}`,
      shipments: Math.floor(Math.random() * 20) + 5,
      revenue: Math.floor(Math.random() * 5000) + 1000,
    }));
  }, [dateRange]);

  const topRoutes = useMemo(() => {
    const routes: Record<string, { count: number; revenue: number }> = {};
    shipments.forEach(s => {
      const key = `${s.origin} → ${s.destination}`;
      if (!routes[key]) routes[key] = { count: 0, revenue: 0 };
      routes[key].count++;
      routes[key].revenue += s.cost;
    });
    return Object.entries(routes)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([route, data]) => ({ route, ...data }));
  }, [shipments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Analytics</h1>
          <p className="text-sm text-text-secondary mt-1">Insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                dateRange === range ? 'bg-cobalt text-white' : 'bg-navy-800 text-text-secondary border border-white/5'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-5">
          <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-cobalt" />
          </div>
          <p className="font-display font-bold text-xl text-text-primary">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-text-secondary mt-1">Total Revenue</p>
        </div>
        <div className="card-surface p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="font-display font-bold text-xl text-text-primary">{(stats.totalWeight / 1000).toFixed(1)}t</p>
          <p className="text-xs text-text-secondary mt-1">Total Weight</p>
        </div>
        <div className="card-surface p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <p className="font-display font-bold text-xl text-text-primary">{stats.avgDelivery}%</p>
          <p className="text-xs text-text-secondary mt-1">Delivery Rate</p>
        </div>
        <div className="card-surface p-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <p className="font-display font-bold text-xl text-text-primary">{stats.activeCount}</p>
          <p className="text-xs text-text-secondary mt-1">Active Now</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-surface p-5">
          <h3 className="font-display font-semibold text-sm text-text-primary mb-4">Shipment Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorShip" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F6DF5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F6DF5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#A7B1C8" fontSize={10} />
              <YAxis stroke="#A7B1C8" fontSize={10} />
              <Tooltip
                contentStyle={{ background: '#11182B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                labelStyle={{ color: '#F4F6FF' }}
              />
              <Area type="monotone" dataKey="shipments" stroke="#4F6DF5" fillOpacity={1} fill="url(#colorShip)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface p-5">
          <h3 className="font-display font-semibold text-sm text-text-primary mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#A7B1C8" fontSize={10} />
              <YAxis stroke="#A7B1C8" fontSize={10} />
              <Tooltip
                contentStyle={{ background: '#11182B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                labelStyle={{ color: '#F4F6FF' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#27C26A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-surface p-5">
          <h3 className="font-display font-semibold text-sm text-text-primary mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#11182B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Legend fontSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface p-5">
          <h3 className="font-display font-semibold text-sm text-text-primary mb-4">Transport Mode</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={modeData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                {modeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#11182B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Legend fontSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface p-5">
          <h3 className="font-display font-semibold text-sm text-text-primary mb-4">Cost by Mode</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={costByMode}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#A7B1C8" fontSize={10} />
              <YAxis stroke="#A7B1C8" fontSize={10} />
              <Tooltip contentStyle={{ background: '#11182B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Bar dataKey="value" fill="#4F6DF5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Routes */}
      <div className="card-surface p-5">
        <h3 className="font-display font-semibold text-sm text-text-primary mb-4">Top Routes</h3>
        <div className="space-y-3">
          {topRoutes.map((route, i) => (
            <div key={route.route} className="flex items-center justify-between p-3 rounded-xl bg-navy-900/60 border border-white/5">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-cobalt/20 flex items-center justify-center text-xs font-mono text-cobalt">
                  {i + 1}
                </span>
                <span className="text-sm text-text-primary">{route.route}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs text-text-secondary">{route.count} shipments</span>
                <span className="text-sm font-mono text-cobalt">${route.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
