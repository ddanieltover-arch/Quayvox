import { useState } from 'react';
import {
  Search,
  Pencil,
  Trash2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Plane,
  Ship as ShipIcon,
  Train,
  Truck,
} from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';
import type { Shipment } from '@/data/mockShipments';
import { getStatusColor } from '@/data/mockShipments';
import type { ShipmentWithExtras } from '@/lib/shipments';
import { ShipmentEditModal } from '@/admin/ShipmentEditModal';
import { ShipmentStatusUpdateModal } from '@/admin/ShipmentStatusUpdateModal';

const modeIcons = { Air: Plane, Ocean: ShipIcon, Rail: Train, Road: Truck };
const statuses: Shipment['status'][] = [
  'Pending',
  'In Transit',
  'Customs',
  'Delivered',
  'Exception',
];

const Shipments = () => {
  const { shipments, deleteShipment, loading } = useShipments();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [sortField, setSortField] = useState<keyof Shipment>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editing, setEditing] = useState<ShipmentWithExtras | null>(null);
  const [updating, setUpdating] = useState<ShipmentWithExtras | null>(null);
  const itemsPerPage = 10;

  const confirmDelete = async (shipment: ShipmentWithExtras) => {
    if (
      !window.confirm(
        `Delete shipment ${shipment.trackingNumber}? This cannot be undone.`
      )
    ) {
      return;
    }
    await deleteShipment(shipment.id);
    setSelectedItems((prev) => prev.filter((id) => id !== shipment.id));
  };

  const deleteSelected = async () => {
    if (!selectedItems.length) return;
    if (
      !window.confirm(
        `Delete ${selectedItems.length} selected shipment(s)? This cannot be undone.`
      )
    ) {
      return;
    }
    for (const id of selectedItems) {
      await deleteShipment(id);
    }
    setSelectedItems([]);
  };

  const filtered = shipments
    .filter((s) => {
      const matchesSearch =
        s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.origin.toLowerCase().includes(search.toLowerCase()) ||
        s.destination.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      const matchesMode = modeFilter === 'All' || s.mode === modeFilter;
      return matchesSearch && matchesStatus && matchesMode;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = (field: keyof Shipment) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === paginated.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginated.map((s) => s.id));
    }
  };

  const exportCSV = () => {
    const headers = [
      'Tracking',
      'Origin',
      'Destination',
      'Carrier',
      'Status',
      'Mode',
      'Weight',
      'Cost',
      'ETA',
    ];
    const rows = filtered.map((s) => [
      s.trackingNumber,
      s.origin,
      s.destination,
      s.carrier,
      s.status,
      s.mode,
      s.weight,
      s.cost,
      s.eta,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipments.csv';
    a.click();
  };

  const openEdit = (shipment: ShipmentWithExtras) => {
    setEditing(shipment);
  };

  const openStatusUpdate = (shipment: ShipmentWithExtras) => {
    setUpdating(shipment);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Shipments</h1>
          <p className="text-sm text-text-secondary mt-1">
            {loading ? 'Loading…' : `${filtered.length} shipments found`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <button
              onClick={() => void deleteSelected()}
              className="btn-secondary flex items-center gap-2 text-sm min-h-11 text-red-400 border-red-500/30 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedItems.length})
            </button>
          )}
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm min-h-11">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracking, origin, destination..."
            className="w-full pl-10 pr-4 py-2.5 min-h-11 rounded-xl bg-navy-800 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 min-h-11 rounded-xl bg-navy-800 border border-white/5 text-text-primary text-sm focus:outline-none focus:border-cobalt/50"
        >
          <option value="All">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="px-3 py-2.5 min-h-11 rounded-xl bg-navy-800 border border-white/5 text-text-primary text-sm focus:outline-none focus:border-cobalt/50"
        >
          <option value="All">All Modes</option>
          <option value="Air">Air</option>
          <option value="Ocean">Ocean</option>
          <option value="Rail">Rail</option>
          <option value="Road">Road</option>
        </select>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paginated.map((shipment) => {
          const ModeIcon = modeIcons[shipment.mode];
          return (
            <div key={shipment.id} className="card-surface p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm text-cobalt">{shipment.trackingNumber}</p>
                  <p className="text-sm text-text-primary mt-1">{shipment.origin}</p>
                  <p className="text-xs text-text-secondary">→ {shipment.destination}</p>
                </div>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border shrink-0 ${getStatusColor(shipment.status)}`}
                >
                  {shipment.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <ModeIcon className="w-4 h-4" />
                  {shipment.mode}
                </span>
                <span className="font-mono text-text-primary">${shipment.cost.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                  <div className="h-full bg-cobalt rounded-full" style={{ width: `${shipment.progress}%` }} />
                </div>
                <span className="text-xs text-text-secondary">{shipment.progress}%</span>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => openStatusUpdate(shipment)}
                  className="p-2.5 min-h-11 min-w-11 rounded-lg hover:bg-white/5 text-text-secondary hover:text-cobalt"
                  aria-label="Update status"
                >
                  <MapPin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(shipment)}
                  className="p-2.5 min-h-11 min-w-11 rounded-lg hover:bg-white/5 text-text-secondary hover:text-cobalt"
                  aria-label="Edit shipment"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => void confirmDelete(shipment)}
                  className="p-2.5 min-h-11 min-w-11 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400"
                  aria-label="Delete shipment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {paginated.length === 0 && (
          <div className="card-surface p-6 text-center text-sm text-text-secondary">
            No shipments match your filters.
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="card-surface overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-navy-800/50">
                <th className="py-3 px-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginated.length && paginated.length > 0}
                    onChange={selectAll}
                    className="rounded border-white/20 bg-navy-700 text-cobalt"
                  />
                </th>
                <th
                  className="py-3 px-3 text-left text-xs font-mono text-text-secondary uppercase cursor-pointer"
                  onClick={() => toggleSort('trackingNumber')}
                >
                  <span className="flex items-center gap-1">
                    Tracking <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="py-3 px-3 text-left text-xs font-mono text-text-secondary uppercase">
                  Route
                </th>
                <th
                  className="py-3 px-3 text-left text-xs font-mono text-text-secondary uppercase cursor-pointer"
                  onClick={() => toggleSort('status')}
                >
                  <span className="flex items-center gap-1">
                    Status <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="py-3 px-3 text-left text-xs font-mono text-text-secondary uppercase">
                  Mode
                </th>
                <th
                  className="py-3 px-3 text-left text-xs font-mono text-text-secondary uppercase cursor-pointer"
                  onClick={() => toggleSort('weight')}
                >
                  <span className="flex items-center gap-1">
                    Weight <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  className="py-3 px-3 text-left text-xs font-mono text-text-secondary uppercase cursor-pointer"
                  onClick={() => toggleSort('cost')}
                >
                  <span className="flex items-center gap-1">
                    Cost <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="py-3 px-3 text-left text-xs font-mono text-text-secondary uppercase">
                  Progress
                </th>
                <th className="py-3 px-3 text-right text-xs font-mono text-text-secondary uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((shipment) => {
                const ModeIcon = modeIcons[shipment.mode];
                return (
                  <tr
                    key={shipment.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(shipment.id)}
                        onChange={() => toggleSelect(shipment.id)}
                        className="rounded border-white/20 bg-navy-700 text-cobalt"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm font-mono text-cobalt">{shipment.trackingNumber}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-sm text-text-primary">{shipment.origin}</div>
                      <div className="text-xs text-text-secondary">→ {shipment.destination}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(shipment.status)}`}
                      >
                        {shipment.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <ModeIcon className="w-4 h-4 text-text-secondary" />
                        <span className="text-sm text-text-primary">{shipment.mode}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm text-text-primary">
                        {(shipment.weight / 1000).toFixed(1)}t
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm font-mono text-text-primary">
                        ${shipment.cost.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden w-16">
                          <div
                            className="h-full bg-cobalt rounded-full"
                            style={{ width: `${shipment.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-secondary">{shipment.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openStatusUpdate(shipment)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-cobalt transition-colors"
                          aria-label="Update status"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(shipment)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-cobalt transition-colors"
                          aria-label="Edit shipment"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => void confirmDelete(shipment)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-colors"
                          aria-label="Delete shipment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <span className="text-xs text-text-secondary">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 text-text-secondary"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  currentPage === page
                    ? 'bg-cobalt text-white'
                    : 'hover:bg-white/5 text-text-secondary'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 text-text-secondary"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile pagination */}
      <div className="md:hidden flex items-center justify-between">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="btn-secondary text-sm min-h-11 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-xs text-text-secondary">
          Page {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="btn-secondary text-sm min-h-11 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <ShipmentEditModal shipment={editing} onClose={() => setEditing(null)} />
      <ShipmentStatusUpdateModal shipment={updating} onClose={() => setUpdating(null)} />
    </div>
  );
};

export default Shipments;
