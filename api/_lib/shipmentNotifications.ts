import type { ShipmentStatus } from '../../emails/constants';
import type { ShipmentEmailContext, ShipmentEmailData } from '../../emails/types';

/** Postgres date columns may arrive as Date objects — emails must receive strings. */
export function formatEmailDate(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  return s ? s.slice(0, 10) : null;
}

export function rowToShipmentEmailData(
  row: Record<string, unknown>,
  extras?: { positionLabel?: string | null }
): ShipmentEmailData {
  const lat = row.current_lat != null ? Number(row.current_lat) : null;
  const lng = row.current_lng != null ? Number(row.current_lng) : null;

  return {
    id: String(row.id),
    trackingNumber: String(row.tracking_number),
    status: row.status as ShipmentStatus,
    origin: String(row.origin),
    destination: String(row.destination),
    carrier: String(row.carrier),
    mode: String(row.mode),
    priority: String(row.priority),
    eta: formatEmailDate(row.eta),
    progress: Number(row.progress) || 0,
    shipper: String(row.shipper),
    consignee: String(row.consignee),
    customerEmail: (row.customer_email as string | null) ?? null,
    senderEmail: (row.sender_email as string | null) ?? null,
    receiverEmail:
      (row.receiver_email as string | null) ??
      (row.customer_email as string | null) ??
      null,
    currentLat: Number.isFinite(lat) ? lat : null,
    currentLng: Number.isFinite(lng) ? lng : null,
    positionLabel: extras?.positionLabel ?? null,
  };
}

export interface ShipmentChangeSet {
  statusChanged: boolean;
  positionChanged: boolean;
  etaChanged: boolean;
  timelineOnly: boolean;
  previousStatus?: ShipmentStatus;
  previousEta?: string | null;
}

export function detectShipmentChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  patch: Record<string, unknown>,
  eventMessage?: string
): ShipmentChangeSet {
  const prevStatus = before.status as ShipmentStatus;
  const nextStatus = after.status as ShipmentStatus;
  const statusChanged =
    Object.prototype.hasOwnProperty.call(patch, 'status') && prevStatus !== nextStatus;

  const prevLat = before.current_lat != null ? Number(before.current_lat) : null;
  const prevLng = before.current_lng != null ? Number(before.current_lng) : null;
  const nextLat = after.current_lat != null ? Number(after.current_lat) : null;
  const nextLng = after.current_lng != null ? Number(after.current_lng) : null;
  const coordsChanged =
    (Object.prototype.hasOwnProperty.call(patch, 'current_lat') ||
      Object.prototype.hasOwnProperty.call(patch, 'current_lng')) &&
    prevLat !== nextLat &&
    prevLng !== nextLng &&
    nextLat != null &&
    nextLng != null;
  const addressChanged =
    Object.prototype.hasOwnProperty.call(patch, 'current_address') &&
    String(before.current_address ?? '').trim() !== String(after.current_address ?? '').trim();
  const positionChanged = coordsChanged || addressChanged;

  const prevEta = formatEmailDate(before.eta);
  const nextEta = formatEmailDate(after.eta);
  const etaChanged =
    Object.prototype.hasOwnProperty.call(patch, 'eta') && prevEta !== nextEta;

  const timelineOnly =
    Boolean(eventMessage) && !statusChanged && !positionChanged && !etaChanged;

  return {
    statusChanged,
    positionChanged,
    etaChanged,
    timelineOnly,
    previousStatus: statusChanged ? prevStatus : undefined,
    previousEta: etaChanged ? prevEta : undefined,
  };
}

export function buildContexts(
  shipment: ShipmentEmailData,
  changes: ShipmentChangeSet,
  eventMessage?: string,
  eventLocation?: string | null
): ShipmentEmailContext[] {
  const contexts: ShipmentEmailContext[] = [];

  if (changes.statusChanged) {
    contexts.push({
      shipment,
      kind: 'status',
      previousStatus: changes.previousStatus,
      eventMessage,
      eventLocation,
    });
  }
  if (changes.positionChanged) {
    contexts.push({
      shipment,
      kind: 'location',
      eventMessage,
      eventLocation,
    });
  }
  if (changes.etaChanged) {
    contexts.push({
      shipment,
      kind: 'eta',
      previousEta: changes.previousEta,
      eventMessage,
      eventLocation,
    });
  }
  if (changes.timelineOnly) {
    contexts.push({
      shipment,
      kind: 'timeline',
      eventMessage,
      eventLocation,
    });
  }

  return contexts;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Unique sender + receiver emails for party notifications. */
export function getPartyNotificationEmails(shipment: ShipmentEmailData): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [shipment.senderEmail, shipment.receiverEmail]) {
    const email = raw?.trim();
    if (!email || !EMAIL_RE.test(email)) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(email);
  }
  return out;
}

export function shouldNotifyCustomer(
  _ctx: ShipmentEmailContext,
  _notifyCustomer: boolean,
  _customerEmail: string | null
): boolean {
  return true;
}

export function shouldNotifyAdmin(_ctx: ShipmentEmailContext): boolean {
  return true;
}
