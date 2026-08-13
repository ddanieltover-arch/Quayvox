import { type ReactNode } from 'react';
import { FileText } from 'lucide-react';
import type { ShipmentWithExtras } from '@/lib/shipments';
import { getStatusColor } from '@/data/mockShipments';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs font-mono uppercase text-text-secondary shrink-0">{label}</span>
      <span className="text-sm text-text-primary sm:text-right break-words">{value || '—'}</span>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1">
      <h3 className="text-xs font-mono uppercase text-cobalt tracking-wide pt-2">{title}</h3>
      <div className="rounded-xl bg-navy-900/60 border border-white/5 px-4">{children}</div>
    </section>
  );
}

interface ShipmentDetailsDialogProps {
  shipment: ShipmentWithExtras;
}

export function ShipmentDetailsDialog({ shipment }: ShipmentDetailsDialogProps) {
  const dims = shipment.dimensions;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 min-h-12 px-4 py-3 rounded-xl bg-navy-800 border border-white/10 text-sm font-medium text-text-primary hover:bg-navy-700 hover:border-cobalt/30 transition-colors"
        >
          <FileText className="w-4 h-4 text-cobalt shrink-0" />
          View complete shipment details
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[min(90vh,720px)] overflow-y-auto bg-navy-800 border-white/10 text-text-primary">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-text-primary pr-8">
            Shipment details
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Full record for {shipment.trackingNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <DetailSection title="Overview">
            <DetailRow label="Tracking" value={<span className="font-mono text-cobalt">{shipment.trackingNumber}</span>} />
            <DetailRow
              label="Status"
              value={
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${getStatusColor(shipment.status)}`}>
                  {shipment.status}
                </span>
              }
            />
            <DetailRow label="Carrier" value={shipment.carrier} />
            <DetailRow label="Mode" value={shipment.mode} />
            <DetailRow label="Priority" value={shipment.priority} />
            <DetailRow label="Progress" value={`${shipment.progress}%`} />
            <DetailRow label="ETA" value={shipment.eta || '—'} />
            <DetailRow label="Cost" value={shipment.cost ? `$${shipment.cost.toLocaleString()}` : '—'} />
            <DetailRow label="Tags" value={shipment.tags?.length ? shipment.tags.join(', ') : '—'} />
          </DetailSection>

          <DetailSection title="Route">
            <DetailRow label="Origin" value={shipment.origin} />
            <DetailRow label="Destination" value={shipment.destination} />
          </DetailSection>

          <DetailSection title="Sender (Origin)">
            <DetailRow label="Name" value={shipment.senderName || shipment.shipper} />
            <DetailRow label="Phone" value={shipment.senderPhone} />
            <DetailRow label="Email" value={shipment.senderEmail} />
            <DetailRow label="Address" value={shipment.senderAddress || shipment.origin} />
          </DetailSection>

          <DetailSection title="Receiver (Destination)">
            <DetailRow label="Name" value={shipment.receiverName || shipment.consignee} />
            <DetailRow label="Phone" value={shipment.receiverPhone} />
            <DetailRow label="Email" value={shipment.receiverEmail || shipment.customerEmail} />
            <DetailRow label="Address" value={shipment.receiverAddress || shipment.destination} />
          </DetailSection>

          <DetailSection title="Schedule">
            <DetailRow label="Current address" value={shipment.currentAddress} />
            <DetailRow label="Departure" value={formatDateTime(shipment.departureAt)} />
            <DetailRow label="Delivery" value={formatDateTime(shipment.deliveryAt)} />
            <DetailRow label="Created" value={formatDateTime(shipment.createdAt)} />
            <DetailRow label="Last updated" value={formatDateTime(shipment.updatedAt)} />
          </DetailSection>

          <DetailSection title="Freight">
            <DetailRow label="Item" value={shipment.itemName} />
            <DetailRow label="Weight" value={shipment.weight ? `${shipment.weight} kg` : '—'} />
            <DetailRow label="Volume" value={shipment.volume != null && shipment.volume > 0 ? `${shipment.volume}` : '—'} />
            <DetailRow
              label="Dimensions (L × W × H)"
              value={
                dims?.l || dims?.w || dims?.h
                  ? `${dims.l} × ${dims.w} × ${dims.h}`
                  : '—'
              }
            />
            <DetailRow label="Payment method" value={shipment.paymentMethod} />
          </DetailSection>

          {shipment.notes ? (
            <DetailSection title="Description">
              <p className="py-3 text-sm text-text-primary whitespace-pre-wrap">{shipment.notes}</p>
            </DetailSection>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
