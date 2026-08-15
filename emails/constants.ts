export const BRAND = {
  name: 'Quayvox',
  cobalt: '#4F6DF5',
  cobaltSoft: '#6B86F7',
  navyDark: '#070A12',
  navyHeader: '#0B1220',
  navySurface: '#11182B',
  navyMid: '#171F33',
  textPrimary: '#0B1220',
  textSecondary: '#4A5568',
  textOnDark: '#F4F6FF',
  textMutedOnDark: '#A7B1C8',
  bgLight: '#F0F3F9',
  bgCanvas: '#070A12',
  surface: '#FFFFFF',
  border: '#E2E8F5',
  borderOnDark: 'rgba(244, 246, 255, 0.10)',
  success: '#27C26A',
  warning: '#F59E0B',
  error: '#EF4444',
  purple: '#A78BFA',
  blue: '#60A5FA',
} as const;

export const FONTS = {
  display:
    "'Sora', 'Segoe UI', Helvetica, Arial, sans-serif",
  body: "'Inter', 'Segoe UI', Helvetica, Arial, sans-serif",
  mono: "'IBM Plex Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
} as const;

export const CONTACT = {
  email: 'info@quayvox.com',
  phoneDisplay: '+1 972-383-9794',
  phoneE164: '+19723839794',
  telHref: 'tel:+19723839794',
  whatsappHref: 'https://wa.me/19723839794',
  mailtoHref: 'mailto:info@quayvox.com',
} as const;

export const BRANCHES = [
  { country: 'USA', continent: 'North America' },
  { country: 'Mexico', continent: 'North America' },
  { country: 'UK', continent: 'Europe' },
  { country: 'Russia', continent: 'Europe / Asia' },
  { country: 'Egypt', continent: 'Africa' },
  { country: 'Japan', continent: 'Asia' },
  { country: 'Australia', continent: 'Oceania' },
] as const;

export const BRANCHES_LINE = BRANCHES.map((b) => b.country).join('  ·  ');

export function appUrl(path = ''): string {
  const base = (process.env.PUBLIC_APP_URL || 'https://www.quayvox.com').replace(/\/$/, '');
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function trackUrl(trackingNumber: string): string {
  return appUrl(`/track/${encodeURIComponent(trackingNumber)}`);
}

export function adminShipmentUrl(shipmentId: string): string {
  return appUrl(`/admin/shipments?highlight=${encodeURIComponent(shipmentId)}`);
}

export type ShipmentStatus = 'Pending' | 'In Transit' | 'Customs' | 'On Hold' | 'Delivered' | 'Exception';
export type EmailTone = 'default' | 'success' | 'warning' | 'danger' | 'customs';
export type EmailAudience = 'customer' | 'admin';

export const TONE_ACCENT: Record<EmailTone, string> = {
  default: BRAND.cobalt,
  success: BRAND.success,
  warning: BRAND.warning,
  danger: BRAND.error,
  customs: BRAND.purple,
};

export const STATUS_COLORS: Record<
  ShipmentStatus,
  { bg: string; text: string; border: string; accent: string }
> = {
  Pending: { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D', accent: BRAND.warning },
  'In Transit': { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD', accent: BRAND.cobalt },
  Customs: { bg: '#EDE9FE', text: '#6D28D9', border: '#C4B5FD', accent: BRAND.purple },
  'On Hold': { bg: '#FFEDD5', text: '#C2410C', border: '#FDBA74', accent: BRAND.warning },
  Delivered: { bg: '#D1FAE5', text: '#047857', border: '#6EE7B7', accent: BRAND.success },
  Exception: { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5', accent: BRAND.error },
};

export const STATUS_COLORS_ON_DARK: Record<
  ShipmentStatus,
  { bg: string; text: string; border: string }
> = {
  Pending: { bg: 'rgba(245, 158, 11, 0.18)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.35)' },
  'In Transit': { bg: 'rgba(79, 109, 245, 0.22)', text: '#A5B4FC', border: 'rgba(79, 109, 245, 0.40)' },
  Customs: { bg: 'rgba(167, 139, 250, 0.20)', text: '#C4B5FD', border: 'rgba(167, 139, 250, 0.38)' },
  'On Hold': { bg: 'rgba(249, 115, 22, 0.20)', text: '#FDBA74', border: 'rgba(249, 115, 22, 0.38)' },
  Delivered: { bg: 'rgba(39, 194, 106, 0.18)', text: '#6EE7B7', border: 'rgba(39, 194, 106, 0.38)' },
  Exception: { bg: 'rgba(239, 68, 68, 0.20)', text: '#FCA5A5', border: 'rgba(239, 68, 68, 0.40)' },
};

export function toneForStatus(status: ShipmentStatus): EmailTone {
  switch (status) {
    case 'Delivered':
      return 'success';
    case 'Exception':
      return 'danger';
    case 'Pending':
    case 'On Hold':
      return 'warning';
    case 'Customs':
      return 'customs';
    default:
      return 'default';
  }
}

export const CUSTOMER_STATUS_COPY: Record<ShipmentStatus, { headline: string; body: string }> = {
  Pending: {
    headline: 'Your booking is confirmed',
    body: 'We have registered your shipment and are preparing the first milestone. Live tracking is already available.',
  },
  'In Transit': {
    headline: 'Your freight is on the move',
    body: 'The shipment is in transit. Open the live track page for map position, progress, and every timeline event.',
  },
  Customs: {
    headline: 'Customs clearance is underway',
    body: 'Your shipment is with customs. We will notify you as soon as clearance completes, or if documents are required.',
  },
  'On Hold': {
    headline: 'Your shipment is on hold',
    body: 'Movement is paused for now. We will update you as soon as the hold is released and transit resumes.',
  },
  Delivered: {
    headline: 'Delivered. Thank you for shipping with us.',
    body: 'This shipment has reached its destination. Keep the tracking number for your records, and contact us if anything looks off.',
  },
  Exception: {
    headline: 'This shipment needs attention',
    body: 'An exception has been logged. Our operations team is reviewing it — reply to this email or WhatsApp us so we can resolve it quickly.',
  },
};

export const ADMIN_STATUS_COPY: Record<ShipmentStatus, { headline: string; body: string }> = {
  Pending: {
    headline: 'Shipment is pending the next step',
    body: 'Awaiting pickup or the first operational milestone. Confirm booking details if anything is still incomplete.',
  },
  'In Transit': {
    headline: 'Shipment is in transit',
    body: 'Freight is moving on the booked route. Position and timeline remain live in admin.',
  },
  Customs: {
    headline: 'Shipment is at customs',
    body: 'Review documentation readiness and carrier notices. Clearance delays should be flagged to the customer promptly.',
  },
  'On Hold': {
    headline: 'Shipment is on hold',
    body: 'Transit is paused. Confirm the hold reason, next action, and keep the customer informed.',
  },
  Delivered: {
    headline: 'Shipment delivered',
    body: 'Delivery is complete. Close the file in admin once proof of delivery is confirmed.',
  },
  Exception: {
    headline: 'Exception — action required',
    body: 'This shipment is in exception. Review the latest event, escalate with the carrier, and keep the customer informed.',
  },
};
