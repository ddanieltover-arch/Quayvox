import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ship, Package, AlertTriangle, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock, DollarSign, Pencil, Trash2, MapPin
} from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';
import { getStatusColor } from '@/data/mockShipments';
import type { ShipmentWithExtras } from '@/lib/shipments';
import { ShipmentEditModal } from '@/admin/ShipmentEditModal';
import { ShipmentStatusUpdateModal } from '@/admin/ShipmentStatusUpdateModal';
import gsap from 'gsap';

const Dashboard = () => {
  const { shipments, deleteShipment } = useShipments();
  const cardsRef = useRef<HTMLDivElement>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [editing, setEditing] = useState<ShipmentWithExtras | null>(null);
  const [updating, setUpdating] = useState<ShipmentWithExtras | null>(null);

  const confirmDelete = async (shipment: ShipmentWithExtras) => {
    if (
      !window.confirm(
        `Delete shipment ${shipment.trackingNumber}? This cannot be undone.`
      )
    ) {
      return;
    }
    await deleteShipment(shipment.id);
  };

  const stats = {
    total: shipments.length,
    active: shipments.filter(s => s.status === 'In Transit').length,
    delivered: shipments.filter(s => s.status === 'Delivered').length,
    exceptions: shipments.filter(s => s.status === 'Exception').length,
    totalCost: shipments.reduce((sum, s) => sum + s.cost, 0),
    avgProgress: Math.round(shipments.reduce((sum, s) => sum + s.progress, 0) / shipments.length),
  };

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll('.stat-card');
    if (cards) {
      gsap.fromTo(cards,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, []);

  const recentShipments = shipments.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Overview of your logistics operations</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                timeRange === range
                  ? 'bg-cobalt text-white'
                  : 'bg-navy-800 text-text-secondary hover:text-text-primary border border-white/5'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card card-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center">
              <Ship className="w-5 h-5 text-cobalt" />
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <ArrowUpRight className="w-3 h-3" />
              12%
            </span>
          </div>
          <p className="font-display font-bold text-2xl text-text-primary">{stats.total}</p>
          <p className="text-xs text-text-secondary mt-1">Total Shipments</p>
        </div>

        <div className="stat-card card-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <ArrowUpRight className="w-3 h-3" />
              8%
            </span>
          </div>
          <p className="font-display font-bold text-2xl text-text-primary">{stats.active}</p>
          <p className="text-xs text-text-secondary mt-1">Active Shipments</p>
        </div>

        <div className="stat-card card-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <ArrowUpRight className="w-3 h-3" />
              23%
            </span>
          </div>
          <p className="font-display font-bold text-2xl text-text-primary">{stats.delivered}</p>
          <p className="text-xs text-text-secondary mt-1">Delivered</p>
        </div>

        <div className="stat-card card-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <span className="flex items-center gap-1 text-xs text-red-400">
              <ArrowDownRight className="w-3 h-3" />
              5%
            </span>
          </div>
          <p className="font-display font-bold text-2xl text-text-primary">{stats.exceptions}</p>
          <p className="text-xs text-text-secondary mt-1">Exceptions</p>
        </div>

        <div className="stat-card card-surface p-5 col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <ArrowUpRight className="w-3 h-3" />
              15%
            </span>
          </div>
          <p className="font-display font-bold text-2xl text-text-primary">
            ${stats.totalCost.toLocaleString()}
          </p>
          <p className="text-xs text-text-secondary mt-1">Total Shipping Costs</p>
        </div>

        <div className="stat-card card-surface p-5 col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <ArrowUpRight className="w-3 h-3" />
              3%
            </span>
          </div>
          <p className="font-display font-bold text-2xl text-text-primary">{stats.avgProgress}%</p>
          <p className="text-xs text-text-secondary mt-1">Average Progress</p>
        </div>
      </div>

      {/* Recent Shipments Table */}
      <div className="card-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-text-primary">Recent Shipments</h2>
          <Link to="/admin/shipments" className="text-sm text-cobalt hover:text-cobalt-light transition-colors">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-2 text-xs font-mono text-text-secondary uppercase">Tracking</th>
                <th className="text-left py-3 px-2 text-xs font-mono text-text-secondary uppercase">Route</th>
                <th className="text-left py-3 px-2 text-xs font-mono text-text-secondary uppercase">Status</th>
                <th className="text-left py-3 px-2 text-xs font-mono text-text-secondary uppercase">Progress</th>
                <th className="text-left py-3 px-2 text-xs font-mono text-text-secondary uppercase">ETA</th>
                <th className="text-right py-3 px-2 text-xs font-mono text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentShipments.map((shipment) => (
                <tr key={shipment.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-2">
                    <span className="text-sm font-mono text-cobalt">{shipment.trackingNumber}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm text-text-primary">{shipment.origin}</span>
                    <span className="text-text-secondary mx-2">→</span>
                    <span className="text-sm text-text-primary">{shipment.destination}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden w-20">
                        <div
                          className="h-full bg-cobalt rounded-full transition-all"
                          style={{ width: `${shipment.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary">{shipment.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm text-text-secondary">{shipment.eta}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setUpdating(shipment)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-cobalt transition-colors"
                        aria-label="Update status"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(shipment)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-cobalt transition-colors"
                        aria-label="Edit shipment"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void confirmDelete(shipment)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-colors"
                        aria-label="Delete shipment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ShipmentEditModal shipment={editing} onClose={() => setEditing(null)} />
      <ShipmentStatusUpdateModal shipment={updating} onClose={() => setUpdating(null)} />
    </div>
  );
};

export default Dashboard;
