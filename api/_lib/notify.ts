import {
  AdminContactReceived,
  CustomerContactConfirmation,
} from '../../emails/templates/ContactEmails';
import {
  AdminShipmentEmail,
  CustomerShipmentEmail,
  adminShipmentSubject,
  customerShipmentSubject,
} from '../../emails/templates/ShipmentEmails';
import type { ContactEmailData, ShipmentEmailContext } from '../../emails/types';
import { adminNotifyEmail, sendEmailSafe } from './mail';
import {
  buildContexts,
  collectPartyEmails,
  detectShipmentChanges,
  rowToShipmentEmailData,
  shouldNotifyAdmin,
  shouldNotifyCustomer,
  type ShipmentChangeSet,
} from './shipmentNotifications';

export async function sendContactEmails(data: ContactEmailData): Promise<{
  customerSent: boolean;
  adminSent: boolean;
}> {
  const admin = adminNotifyEmail();
  let customerSent = false;
  let adminSent = false;

  const customerResult = await sendEmailSafe({
    to: data.email,
    subject: 'We received your message — Quayvox',
    react: CustomerContactConfirmation({ data }),
    replyTo: admin ?? undefined,
  });
  customerSent = customerResult.emailSent;

  if (admin) {
    const adminResult = await sendEmailSafe({
      to: admin,
      subject: `Quayvox contact from ${data.name}`,
      react: AdminContactReceived({ data }),
      replyTo: data.email,
    });
    adminSent = adminResult.emailSent;
  }

  return { customerSent, adminSent };
}

export async function sendShipmentCreatedEmails(
  row: Record<string, unknown>
): Promise<{ customerSent: boolean; adminSent: boolean }> {
  const shipment = rowToShipmentEmailData(row);
  const ctx: ShipmentEmailContext = { shipment, kind: 'created' };
  return dispatchShipmentContexts([ctx], {
    notifyCustomer: true,
    partyEmails: collectPartyEmails(row, shipment),
  });
}

export async function sendShipmentUpdateEmails(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  patch: Record<string, unknown>,
  options: {
    notifyCustomer?: boolean;
    eventMessage?: string;
    eventLocation?: string | null;
    positionLabel?: string | null;
  } = {}
): Promise<{
  customerSent: boolean;
  adminSent: boolean;
  contexts: number;
  partyEmails: string[];
  adminEmail: string | null;
  failures: Array<{ to: string; error: string }>;
}> {
  const shipment = rowToShipmentEmailData(after, { positionLabel: options.positionLabel });
  const fallbackMessage =
    options.eventMessage?.trim() ||
    (Object.prototype.hasOwnProperty.call(patch, 'status')
      ? `Status updated to ${shipment.status}`
      : 'Shipment updated');

  const changes = detectShipmentChanges(before, after, patch, fallbackMessage);
  const contexts = buildContexts(
    shipment,
    changes,
    fallbackMessage,
    options.eventLocation
  );

  const partyEmails = collectPartyEmails(before, after, shipment);
  const admin = adminNotifyEmail();

  if (!partyEmails.length) {
    console.warn(
      'shipment update emails: no sender/receiver emails on file',
      shipment.trackingNumber,
      {
        sender: after.sender_email ?? before.sender_email,
        receiver: after.receiver_email ?? before.receiver_email,
        customer: after.customer_email ?? before.customer_email,
      }
    );
  }
  if (!admin) {
    console.warn('shipment update emails: ADMIN_EMAIL / CONTACT_TO_EMAIL not configured');
  }

  const result = await dispatchShipmentContexts(contexts, {
    notifyCustomer: options.notifyCustomer ?? true,
    partyEmails,
  });

  return {
    ...result,
    contexts: contexts.length,
    partyEmails,
    adminEmail: admin,
  };
}

async function dispatchShipmentContexts(
  contexts: ShipmentEmailContext[],
  options: { notifyCustomer: boolean; partyEmails?: string[] }
): Promise<{
  customerSent: boolean;
  adminSent: boolean;
  failures: Array<{ to: string; error: string }>;
}> {
  const admin = adminNotifyEmail();
  let customerSent = false;
  let adminSent = false;
  const failures: Array<{ to: string; error: string }> = [];

  for (const ctx of contexts) {
    const partyEmails = options.partyEmails ?? collectPartyEmails(ctx.shipment);
    const partyJobs = partyEmails
      .filter((email) => shouldNotifyCustomer(ctx, options.notifyCustomer, email))
      .map(async (email) => {
        const result = await sendEmailSafe(
          {
            to: email,
            subject: customerShipmentSubject(ctx),
            react: CustomerShipmentEmail({ ctx }),
          },
          { template: `customer/${ctx.kind}`, trackingNumber: ctx.shipment.trackingNumber }
        );
        if (result.emailSent) {
          customerSent = true;
          return;
        }
        const error = result.error || 'Email was not sent';
        console.error('party shipment email failed', {
          to: email,
          trackingNumber: ctx.shipment.trackingNumber,
          kind: ctx.kind,
          error,
        });
        failures.push({ to: email, error });
      });

    await Promise.all(partyJobs);

    if (shouldNotifyAdmin(ctx) && admin) {
      const result = await sendEmailSafe(
        {
          to: admin,
          subject: adminShipmentSubject(ctx),
          react: AdminShipmentEmail({ ctx }),
        },
        { template: `admin/${ctx.kind}`, trackingNumber: ctx.shipment.trackingNumber }
      );
      if (result.emailSent) {
        adminSent = true;
      } else {
        const error = result.error || 'Email was not sent';
        console.error('admin shipment email failed', {
          to: admin,
          trackingNumber: ctx.shipment.trackingNumber,
          kind: ctx.kind,
          error,
        });
        failures.push({ to: admin, error });
      }
    }
  }

  return { customerSent, adminSent, failures };
}

export type { ShipmentChangeSet };
