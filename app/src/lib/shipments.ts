import type { Shipment } from '@/data/mockShipments';

export type ShipmentStatus = Shipment['status'];
export type ShipmentMode = Shipment['mode'];
export type ShipmentPriority = Shipment['priority'];

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: string | null;
  location: string | null;
  message: string;
  occurredAt: string;
}

export interface ShipmentRow {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  carrier: string;
  status: ShipmentStatus;
  weight: number;
  dim_l: number;
  dim_w: number;
  dim_h: number;
  cost: number;
  eta: string | null;
  progress: number;
  mode: ShipmentMode;
  priority: ShipmentPriority;
  shipper: string;
  consignee: string;
  documents: string[] | null;
  tags: string[] | null;
  customer_email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentEventRow {
  id: string;
  shipment_id: string;
  status: string | null;
  location: string | null;
  message: string;
  occurred_at: string;
  created_at: string;
}

export type ShipmentWithExtras = Shipment & {
  customerEmail?: string | null;
  notes?: string | null;
};

export function mapShipmentRow(row: ShipmentRow): ShipmentWithExtras {
  return {
    id: row.id,
    trackingNumber: row.tracking_number,
    origin: row.origin,
    destination: row.destination,
    carrier: row.carrier,
    status: row.status,
    weight: Number(row.weight),
    dimensions: {
      l: Number(row.dim_l),
      w: Number(row.dim_w),
      h: Number(row.dim_h),
    },
    cost: Number(row.cost),
    eta: row.eta ? String(row.eta).slice(0, 10) : '',
    progress: row.progress,
    mode: row.mode,
    priority: row.priority,
    shipper: row.shipper,
    consignee: row.consignee,
    createdAt: row.created_at.slice(0, 10),
    updatedAt: row.updated_at.slice(0, 10),
    documents: row.documents ?? [],
    tags: row.tags ?? [],
    customerEmail: row.customer_email,
    notes: row.notes,
  };
}

export function mapEventRow(row: ShipmentEventRow): ShipmentEvent {
  return {
    id: row.id,
    shipmentId: row.shipment_id,
    status: row.status,
    location: row.location,
    message: row.message,
    occurredAt: row.occurred_at,
  };
}

export function toShipmentInsert(
  data: Omit<ShipmentWithExtras, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'> & {
    trackingNumber?: string;
  }
) {
  const tracking =
    data.trackingNumber ||
    `SH-${new Date().getFullYear()}-${Math.floor(7000 + Math.random() * 2999)}`;

  return {
    tracking_number: tracking,
    origin: data.origin,
    destination: data.destination,
    carrier: data.carrier,
    status: data.status,
    weight: data.weight,
    dim_l: data.dimensions.l,
    dim_w: data.dimensions.w,
    dim_h: data.dimensions.h,
    cost: data.cost,
    eta: data.eta || null,
    progress: data.progress,
    mode: data.mode,
    priority: data.priority,
    shipper: data.shipper,
    consignee: data.consignee,
    documents: data.documents ?? [],
    tags: data.tags ?? [],
    customer_email: data.customerEmail ?? null,
    notes: data.notes ?? null,
  };
}

export function toShipmentUpdate(updates: Partial<ShipmentWithExtras>) {
  const row: Record<string, unknown> = {};
  if (updates.trackingNumber !== undefined) row.tracking_number = updates.trackingNumber;
  if (updates.origin !== undefined) row.origin = updates.origin;
  if (updates.destination !== undefined) row.destination = updates.destination;
  if (updates.carrier !== undefined) row.carrier = updates.carrier;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.weight !== undefined) row.weight = updates.weight;
  if (updates.dimensions !== undefined) {
    row.dim_l = updates.dimensions.l;
    row.dim_w = updates.dimensions.w;
    row.dim_h = updates.dimensions.h;
  }
  if (updates.cost !== undefined) row.cost = updates.cost;
  if (updates.eta !== undefined) row.eta = updates.eta || null;
  if (updates.progress !== undefined) row.progress = updates.progress;
  if (updates.mode !== undefined) row.mode = updates.mode;
  if (updates.priority !== undefined) row.priority = updates.priority;
  if (updates.shipper !== undefined) row.shipper = updates.shipper;
  if (updates.consignee !== undefined) row.consignee = updates.consignee;
  if (updates.documents !== undefined) row.documents = updates.documents;
  if (updates.tags !== undefined) row.tags = updates.tags;
  if (updates.customerEmail !== undefined) row.customer_email = updates.customerEmail;
  if (updates.notes !== undefined) row.notes = updates.notes;
  return row;
}
