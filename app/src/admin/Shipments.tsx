import { useState } from 'react';
import {
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Plane,
  Ship as ShipIcon,
  Train,
  Truck,
  X,
} from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';
import type { Shipment } from '@/data/mockShipments';
import { getStatusColor } from '@/data/mockShipments';
import type { ShipmentWithExtras } from '@/lib/shipments';

const modeIcons = { Air: Plane, Ocean: ShipIcon, Rail: Train, Road: Truck };
const statuses: Shipment['status'][] = [
  'Pending',
  'In Transit',
  'Customs',
  'Delivered',
  'Exception',
];

const Shipments = () => {
  const { shipments, deleteShipment, updateShipment, loading } = useShipments();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [sortField, setSortField] = useState<keyof Shipment>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editing, setEditing] = useState<ShipmentWithExtras | null>(null);
  const [editForm, setEditForm] = useState({
    status: 'Pending' as Shipment['status'],
    progress: 0,
    eta: '',
    customerEmail: '',
    notes: '',
    currentAddress: '',
  });
  const [saving, setSaving] = useState(false);
  const itemsPerPage = 10;

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
    setEditForm({
      status: shipment.status,
      progress: shipment.progress,
      eta: shipment.eta,
      customerEmail: shipment.customerEmail || '',
      notes: shipment.notes || '',
      currentAddress: shipment.currentAddress || '',
    });
  };

  const saveEdit = async () => {
    if (!editing) return;

    setSaving(true);

    const updates: Parameters<typeof updateShipment>[1] = {
      status: editForm.status,
      progress: editForm.progress,
      eta: editForm.eta,
      customerEmail: editForm.customerEmail || null,
      notes: editForm.notes || null,
    };

    const nextCurrentAddress = editForm.currentAddress.trim();
    const addressChanged = nextCurrentAddress !== (editing.currentAddress ?? '').trim();
    const statusChanged = editForm.status !== editing.status;
    const etaChanged = editForm.eta !== editing.eta;

    if (addressChanged) {
      updates.currentAddress = nextCurrentAddress || null;
    }

    await updateShipment(editing.id, updates, {
      eventMessage: statusChanged
        ? `Status updated to ${editForm.status}`
        : addressChanged
          ? 'Location updated'
          : etaChanged
            ? 'ETA updated'
            : undefined,
      eventLocation: addressChanged ? nextCurrentAddress : undefined,
    });
    setSaving(false);
    setEditing(null);
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
                  onClick={() => openEdit(shipment)}
                  className="p-2.5 min-h-11 min-w-11 rounded-lg hover:bg-white/5 text-text-secondary hover:text-cobalt"
                  aria-label="Edit shipment"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => void deleteShipment(shipment.id)}
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
                          onClick={() => openEdit(shipment)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-cobalt transition-colors"
                          aria-label="Edit shipment"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => void deleteShipment(shipment.id)}
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

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="w-full sm:max-w-lg card-surface rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-semibold text-lg text-text-primary">Edit shipment</h2>
                <p className="text-xs font-mono text-cobalt mt-1">{editing.trackingNumber}</p>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-2 rounded-lg hover:bg-white/5 text-text-secondary"
                aria-label="Close"
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
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, status: e.target.value as Shipment['status'] }))
                  }
                  className="w-full min-h-11 px-3 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm"
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
                  Progress ({editForm.progress}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editForm.progress}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, progress: Number(e.target.value) }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
                  ETA
                </label>
                <input
                  type="date"
                  value={editForm.eta}
                  onChange={(e) => setEditForm((f) => ({ ...f, eta: e.target.value }))}
                  className="w-full min-h-11 px-3 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
                  Customer email
                </label>
                <input
                  type="email"
                  value={editForm.customerEmail}
                  onChange={(e) => setEditForm((f) => ({ ...f, customerEmail: e.target.value }))}
                  className="w-full min-h-11 px-3 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm"
                  placeholder="notify@customer.com"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
                  Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-secondary mb-2">
                  Current address
                </label>
                <textarea
                  value={editForm.currentAddress}
                  onChange={(e) => setEditForm((f) => ({ ...f, currentAddress: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm"
                  placeholder="e.g. Port of Los Angeles, Berth 302, San Pedro, CA 90731, USA"
                />
              </div>

              <p className="text-xs text-text-secondary">
                Sender and receiver are emailed automatically on every update when their email is on file.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditing(null)}
                  className="btn-secondary flex-1 min-h-11"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void saveEdit()}
                  disabled={saving}
                  className="btn-primary flex-1 min-h-11 disabled:opacity-60"
                  type="button"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipments;
