import { Text } from '@react-email/components';
import {
  ADMIN_STATUS_COPY,
  BRAND,
  CONTACT,
  CUSTOMER_STATUS_COPY,
  copyForStatus,
  FONTS,
  adminShipmentUrl,
  toneForStatus,
  trackUrl,
  type EmailTone,
  type ShipmentStatus,
} from '../constants';
import { QuayvoxLayout } from '../layout/QuayvoxLayout';
import { CtaButton, CtaRow } from '../components/CtaButton';
import { Callout, MetricGrid } from '../components/ShipmentFacts';
import { ProgressBar } from '../components/ProgressBar';
import { RouteCard } from '../components/RouteCard';
import { StatusBadge } from '../components/StatusBadge';
import type { ShipmentEmailContext } from '../types';

function customerEyebrow(ctx: ShipmentEmailContext): string {
  switch (ctx.kind) {
    case 'created':
      return 'Booking confirmed';
    case 'location':
      return 'Live position';
    case 'eta':
      return 'Schedule change';
    case 'timeline':
      return 'Milestone';
    case 'status':
      return ctx.shipment.status;
    default:
      return 'Shipment update';
  }
}

function headlineForCustomer(ctx: ShipmentEmailContext): string {
  switch (ctx.kind) {
    case 'created':
      return 'Your shipment is ready to track';
    case 'location':
      return 'A new location has been logged';
    case 'eta':
      return 'The estimated arrival has changed';
    case 'timeline':
      return 'A new milestone was added';
    case 'status':
      return copyForStatus(CUSTOMER_STATUS_COPY, ctx.shipment.status).headline;
    default:
      return 'Your shipment was updated';
  }
}

function bodyForCustomer(ctx: ShipmentEmailContext): string {
  switch (ctx.kind) {
    case 'created':
      return 'Tracking is now live. Use the page below for map position, progress, and every event on this booking.';
    case 'location': {
      const label = ctx.shipment.positionLabel || ctx.eventLocation;
      return label
        ? `Latest reported position: ${label}. Open the live map for the full trail.`
        : 'The live map position was updated. Open your track page for the latest location.';
    }
    case 'eta':
      return `Estimated arrival moved from ${ctx.previousEta ?? 'TBC'} to ${ctx.shipment.eta ?? 'TBC'}. We will keep you posted if it changes again.`;
    case 'timeline':
      return ctx.eventMessage || 'A new event was added to your shipment timeline.';
    case 'status':
      return copyForStatus(CUSTOMER_STATUS_COPY, ctx.shipment.status).body;
    default:
      return 'View the latest details on your track page.';
  }
}

function adminEyebrow(ctx: ShipmentEmailContext): string {
  switch (ctx.kind) {
    case 'created':
      return 'New booking';
    case 'location':
      return 'Position update';
    case 'eta':
      return 'ETA change';
    case 'timeline':
      return 'Timeline event';
    case 'status':
      return `Status · ${ctx.shipment.status}`;
    default:
      return 'Operations';
  }
}

function headlineForAdmin(ctx: ShipmentEmailContext): string {
  switch (ctx.kind) {
    case 'created':
      return 'A new shipment was created';
    case 'location':
      return 'Map position was updated';
    case 'eta':
      return 'ETA was revised';
    case 'timeline':
      return 'A timeline event was logged';
    case 'status':
      return copyForStatus(ADMIN_STATUS_COPY, ctx.shipment.status).headline;
    default:
      return 'Shipment updated';
  }
}

function bodyForAdmin(ctx: ShipmentEmailContext): string {
  switch (ctx.kind) {
    case 'created':
      return 'Review route, customer email, and the opening status. Tracking is already available to the customer if an email was provided.';
    case 'location': {
      const label = ctx.shipment.positionLabel || ctx.eventLocation;
      const coords =
        ctx.shipment.currentLat != null && ctx.shipment.currentLng != null
          ? `${ctx.shipment.currentLat.toFixed(4)}, ${ctx.shipment.currentLng.toFixed(4)}`
          : null;
      return [label, coords].filter(Boolean).join(' · ') || 'Map position was updated in admin.';
    }
    case 'eta':
      return `ETA changed from ${ctx.previousEta ?? 'TBC'} to ${ctx.shipment.eta ?? 'TBC'}.`;
    case 'timeline':
      return ctx.eventMessage || 'A timeline event was recorded.';
    case 'status': {
      const prev = ctx.previousStatus ? `Previous status: ${ctx.previousStatus}. ` : '';
      return `${prev}${copyForStatus(ADMIN_STATUS_COPY, ctx.shipment.status).body}`;
    }
    default:
      return 'Open admin to review this shipment.';
  }
}

function extraMetrics(ctx: ShipmentEmailContext): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];
  if (ctx.kind === 'location') {
    if (ctx.shipment.positionLabel || ctx.eventLocation) {
      rows.push({ label: 'Location', value: ctx.shipment.positionLabel || ctx.eventLocation || '—' });
    }
    if (ctx.shipment.currentLat != null && ctx.shipment.currentLng != null) {
      rows.push({
        label: 'Coordinates',
        value: `${ctx.shipment.currentLat.toFixed(4)}, ${ctx.shipment.currentLng.toFixed(4)}`,
      });
    }
  }
  if (ctx.kind === 'timeline' && ctx.eventLocation) {
    rows.push({ label: 'Event location', value: ctx.eventLocation });
  }
  return rows;
}

function toneForContext(ctx: ShipmentEmailContext): EmailTone {
  if (ctx.kind === 'status' || ctx.shipment.status === 'Exception') {
    return toneForStatus(ctx.shipment.status);
  }
  if (ctx.kind === 'eta') return 'warning';
  if (ctx.kind === 'created') return 'default';
  return 'default';
}

function HeaderMeta({
  status,
  trackingNumber,
}: {
  status: ShipmentStatus;
  trackingNumber: string;
}) {
  return (
    <table cellPadding={0} cellSpacing={0} role="presentation">
      <tbody>
        <tr>
          <td valign="middle" style={{ paddingRight: '10px' }}>
            <StatusBadge status={status} onDark />
          </td>
          <td valign="middle">
            <Text
              style={{
                margin: 0,
                fontFamily: FONTS.mono,
                fontSize: '13px',
                letterSpacing: '0.04em',
                color: BRAND.textOnDark,
              }}
            >
              {trackingNumber}
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function ShipmentBody({
  ctx,
  isAdmin,
}: {
  ctx: ShipmentEmailContext;
  isAdmin: boolean;
}) {
  const isException = ctx.shipment.status === 'Exception' && ctx.kind === 'status';
  const accent = toneForStatus(ctx.shipment.status);
  const accentColor =
    accent === 'success'
      ? BRAND.success
      : accent === 'danger'
        ? BRAND.error
        : accent === 'warning'
          ? BRAND.warning
          : accent === 'customs'
            ? BRAND.purple
            : BRAND.cobalt;

  return (
    <>
      <RouteCard origin={ctx.shipment.origin} destination={ctx.shipment.destination} />
      <ProgressBar progress={ctx.shipment.progress} accent={accentColor} />
      {ctx.kind === 'timeline' && ctx.eventMessage ? (
        <Callout title="Latest event" body={ctx.eventMessage} />
      ) : null}
      {isAdmin && ctx.shipment.customerEmail ? (
        <Callout title="Customer email" body={ctx.shipment.customerEmail} />
      ) : null}
      {isException ? (
        <Callout
          title="Exception"
          body={isAdmin ? bodyForAdmin(ctx) : bodyForCustomer(ctx)}
          tone="danger"
        />
      ) : null}
      <MetricGrid shipment={ctx.shipment} extra={extraMetrics(ctx)} />
      {isAdmin ? (
        <CtaRow>
          <CtaButton
            href={adminShipmentUrl(ctx.shipment.id)}
            label="Open in admin"
            variant={isException ? 'danger' : 'primary'}
          />
        </CtaRow>
      ) : (
        <>
          <CtaRow>
            <CtaButton
              href={trackUrl(ctx.shipment.trackingNumber)}
              label="Track shipment"
              variant={isException ? 'danger' : 'primary'}
            />
          </CtaRow>
          {isException ? (
            <CtaRow>
              <CtaButton href={CONTACT.whatsappHref} label="WhatsApp support" variant="secondary" />
            </CtaRow>
          ) : (
            <Text
              style={{
                margin: '0 0 24px',
                fontSize: '13px',
                lineHeight: '20px',
                color: BRAND.textSecondary,
              }}
            >
              Questions? {CONTACT.email} · {CONTACT.phoneDisplay}
            </Text>
          )}
        </>
      )}
    </>
  );
}

export function CustomerShipmentEmail({ ctx }: { ctx: ShipmentEmailContext }) {
  const preview = `${ctx.shipment.trackingNumber} — ${headlineForCustomer(ctx)}`;

  return (
    <QuayvoxLayout
      preview={preview}
      audience="customer"
      tone={toneForContext(ctx)}
      eyebrow={customerEyebrow(ctx)}
      headline={headlineForCustomer(ctx)}
      subhead={ctx.kind === 'status' && ctx.shipment.status === 'Exception' ? undefined : bodyForCustomer(ctx)}
      headerMeta={<HeaderMeta status={ctx.shipment.status} trackingNumber={ctx.shipment.trackingNumber} />}
    >
      <ShipmentBody ctx={ctx} isAdmin={false} />
    </QuayvoxLayout>
  );
}

export function AdminShipmentEmail({ ctx }: { ctx: ShipmentEmailContext }) {
  const preview = `[Admin] ${ctx.shipment.trackingNumber} — ${headlineForAdmin(ctx)}`;

  return (
    <QuayvoxLayout
      preview={preview}
      audience="admin"
      tone={toneForContext(ctx)}
      eyebrow={adminEyebrow(ctx)}
      headline={headlineForAdmin(ctx)}
      subhead={ctx.kind === 'status' && ctx.shipment.status === 'Exception' ? undefined : bodyForAdmin(ctx)}
      headerMeta={<HeaderMeta status={ctx.shipment.status} trackingNumber={ctx.shipment.trackingNumber} />}
    >
      <ShipmentBody ctx={ctx} isAdmin />
    </QuayvoxLayout>
  );
}

export function customerShipmentSubject(ctx: ShipmentEmailContext): string {
  const tn = ctx.shipment.trackingNumber;
  switch (ctx.kind) {
    case 'created':
      return `Tracking ready — ${tn}`;
    case 'location':
      return `Location update — ${tn}`;
    case 'eta':
      return `ETA revised — ${tn}`;
    case 'timeline':
      return `Shipment update — ${tn}`;
    case 'status':
      return `${tn} is now ${ctx.shipment.status}`;
    default:
      return `Shipment update — ${tn}`;
  }
}

export function adminShipmentSubject(ctx: ShipmentEmailContext): string {
  const tn = ctx.shipment.trackingNumber;
  const urgent = ctx.shipment.status === 'Exception' ? '⚠ ' : '';
  switch (ctx.kind) {
    case 'created':
      return `${urgent}[Admin] New shipment ${tn}`;
    case 'location':
      return `${urgent}[Admin] Position updated — ${tn}`;
    case 'eta':
      return `${urgent}[Admin] ETA changed — ${tn}`;
    case 'timeline':
      return `${urgent}[Admin] Timeline event — ${tn}`;
    case 'status':
      return `${urgent}[Admin] ${tn} → ${ctx.shipment.status}`;
    default:
      return `${urgent}[Admin] Shipment update — ${tn}`;
  }
}

export function isExceptionStatus(status: ShipmentStatus): boolean {
  return status === 'Exception';
}
