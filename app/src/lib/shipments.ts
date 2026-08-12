import type { Shipment } from '@/data/mockShipments';
import { lookupPortCoords } from '@/lib/geoPorts';

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

export interface ShipmentPosition {
  id: string;
  shipmentId: string;
  lat: number;
  lng: number;
  label: string | null;
  recordedAt: string;
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
  sender_name?: string | null;
  sender_phone?: string | null;
  sender_email?: string | null;
  sender_street?: string | null;
  sender_city?: string | null;
  sender_state?: string | null;
  sender_postal?: string | null;
  sender_country?: string | null;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  receiver_email?: string | null;
  receiver_street?: string | null;
  receiver_city?: string | null;
  receiver_state?: string | null;
  receiver_postal?: string | null;
  receiver_country?: string | null;
  departure_at?: string | null;
  delivery_at?: string | null;
  volume?: number | null;
  payment_method?: string | null;
  sender_address?: string | null;
  receiver_address?: string | null;
  current_address?: string | null;
  origin_lat?: number | null;
  origin_lng?: number | null;
  destination_lat?: number | null;
  destination_lng?: number | null;
  current_lat?: number | null;
  current_lng?: number | null;
  current_location_updated_at?: string | null;
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

export interface ShipmentPositionRow {
  id: string;
  shipment_id: string;
  lat: number;
  lng: number;
  label: string | null;
  recorded_at: string;
  created_at: string;
}

export type ShipmentWithExtras = Shipment & {
  customerEmail?: string | null;
  notes?: string | null;
};

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function joinLegacyAddress(parts: Array<string | null | undefined>): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(', ');
}

export function mapShipmentRow(row: ShipmentRow): ShipmentWithExtras {
  const senderAddress =
    row.sender_address?.trim() ||
    joinLegacyAddress([
      row.sender_street,
      row.sender_city,
      row.sender_state,
      row.sender_postal,
      row.sender_country,
    ]) ||
    row.origin ||
    '';
  const receiverAddress =
    row.receiver_address?.trim() ||
    joinLegacyAddress([
      row.receiver_street,
      row.receiver_city,
      row.receiver_state,
      row.receiver_postal,
      row.receiver_country,
    ]) ||
    row.destination ||
    '';

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
    senderName: row.sender_name ?? row.shipper ?? '',
    senderPhone: row.sender_phone ?? '',
    senderEmail: row.sender_email ?? null,
    senderAddress,
    receiverName: row.receiver_name ?? row.consignee ?? '',
    receiverPhone: row.receiver_phone ?? '',
    receiverEmail: row.receiver_email ?? row.customer_email ?? null,
    receiverAddress,
    currentAddress: row.current_address ?? null,
    departureAt: row.departure_at ?? null,
    deliveryAt: row.delivery_at ?? null,
    volume: row.volume != null ? Number(row.volume) : 0,
    paymentMethod: row.payment_method ?? '',
    originLat: asNullableNumber(row.origin_lat),
    originLng: asNullableNumber(row.origin_lng),
    destinationLat: asNullableNumber(row.destination_lat),
    destinationLng: asNullableNumber(row.destination_lng),
    currentLat: asNullableNumber(row.current_lat),
    currentLng: asNullableNumber(row.current_lng),
    currentLocationUpdatedAt: row.current_location_updated_at ?? null,
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

export function mapPositionRow(row: ShipmentPositionRow): ShipmentPosition {
  return {
    id: row.id,
    shipmentId: row.shipment_id,
    lat: Number(row.lat),
    lng: Number(row.lng),
    label: row.label,
    recordedAt: row.recorded_at,
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

  const originLookup = lookupPortCoords(data.origin);
  const destLookup = lookupPortCoords(data.destination);

  const senderName = data.senderName ?? data.shipper ?? '';
  const receiverName = data.receiverName ?? data.consignee ?? '';
  const receiverEmail = data.receiverEmail ?? data.customerEmail ?? null;
  const senderAddress = data.senderAddress?.trim() || data.origin;
  const receiverAddress = data.receiverAddress?.trim() || data.destination;

  return {
    tracking_number: tracking,
    origin: senderAddress,
    destination: receiverAddress,
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
    shipper: senderName,
    consignee: receiverName,
    documents: data.documents ?? [],
    tags: data.tags ?? [],
    customer_email: receiverEmail,
    notes: data.notes ?? null,
    sender_name: senderName,
    sender_phone: data.senderPhone ?? '',
    sender_email: data.senderEmail ?? null,
    sender_address: senderAddress,
    sender_street: '',
    sender_city: '',
    sender_state: null,
    sender_postal: null,
    sender_country: '',
    receiver_name: receiverName,
    receiver_phone: data.receiverPhone ?? '',
    receiver_email: receiverEmail,
    receiver_address: receiverAddress,
    receiver_street: '',
    receiver_city: '',
    receiver_state: null,
    receiver_postal: null,
    receiver_country: '',
    current_address: data.currentAddress ?? null,
    departure_at: data.departureAt ?? null,
    delivery_at: data.deliveryAt ?? null,
    volume: data.volume ?? 0,
    payment_method: data.paymentMethod ?? '',
    origin_lat: data.originLat ?? originLookup?.[0] ?? null,
    origin_lng: data.originLng ?? originLookup?.[1] ?? null,
    destination_lat: data.destinationLat ?? destLookup?.[0] ?? null,
    destination_lng: data.destinationLng ?? destLookup?.[1] ?? null,
    current_lat: data.currentLat ?? null,
    current_lng: data.currentLng ?? null,
  };
}

export function toShipmentUpdate(updates: Partial<ShipmentWithExtras> & { positionLabel?: string | null }) {
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
  if (updates.senderName !== undefined) {
    row.sender_name = updates.senderName;
    row.shipper = updates.shipper ?? updates.senderName;
  }
  if (updates.senderPhone !== undefined) row.sender_phone = updates.senderPhone;
  if (updates.senderEmail !== undefined) row.sender_email = updates.senderEmail;
  if (updates.senderAddress !== undefined) {
    row.sender_address = updates.senderAddress;
    row.origin = updates.origin ?? updates.senderAddress;
  }
  if (updates.receiverName !== undefined) {
    row.receiver_name = updates.receiverName;
    row.consignee = updates.consignee ?? updates.receiverName;
  }
  if (updates.receiverPhone !== undefined) row.receiver_phone = updates.receiverPhone;
  if (updates.receiverEmail !== undefined) {
    row.receiver_email = updates.receiverEmail;
    row.customer_email = updates.customerEmail ?? updates.receiverEmail;
  }
  if (updates.receiverAddress !== undefined) {
    row.receiver_address = updates.receiverAddress;
    row.destination = updates.destination ?? updates.receiverAddress;
  }
  if (updates.currentAddress !== undefined) row.current_address = updates.currentAddress;
  if (updates.departureAt !== undefined) row.departure_at = updates.departureAt;
  if (updates.deliveryAt !== undefined) row.delivery_at = updates.deliveryAt;
  if (updates.volume !== undefined) row.volume = updates.volume;
  if (updates.paymentMethod !== undefined) row.payment_method = updates.paymentMethod;
  if (updates.originLat !== undefined) row.origin_lat = updates.originLat;
  if (updates.originLng !== undefined) row.origin_lng = updates.originLng;
  if (updates.destinationLat !== undefined) row.destination_lat = updates.destinationLat;
  if (updates.destinationLng !== undefined) row.destination_lng = updates.destinationLng;
  if (updates.currentLat !== undefined) row.current_lat = updates.currentLat;
  if (updates.currentLng !== undefined) row.current_lng = updates.currentLng;
  if (updates.positionLabel !== undefined) row.position_label = updates.positionLabel;
  return row;
}
