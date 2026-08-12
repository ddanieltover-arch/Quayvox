import type { ShipmentStatus } from './constants';

export interface ShipmentEmailData {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  carrier: string;
  mode: string;
  priority: string;
  eta: string | null;
  progress: number;
  shipper: string;
  consignee: string;
  customerEmail: string | null;
  currentLat: number | null;
  currentLng: number | null;
  positionLabel: string | null;
}

export interface ContactEmailData {
  name: string;
  email: string;
  company: string | null;
  message: string;
}

export type ShipmentEmailKind =
  | 'created'
  | 'status'
  | 'location'
  | 'eta'
  | 'timeline';

export interface ShipmentEmailContext {
  shipment: ShipmentEmailData;
  kind: ShipmentEmailKind;
  previousStatus?: ShipmentStatus;
  previousEta?: string | null;
  eventMessage?: string;
  eventLocation?: string | null;
}
