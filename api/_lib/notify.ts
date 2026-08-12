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
  detectShipmentChanges,
  getPartyNotificationEmails,
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
  return dispatchShipmentContexts([ctx], { notifyCustomer: true });
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
): Promise<{ customerSent: boolean; adminSent: boolean; contexts: number }> {
  const shipment = rowToShipmentEmailData(after, { positionLabel: options.positionLabel });
  const changes = detectShipmentChanges(before, after, patch, options.eventMessage);
  const contexts = buildContexts(
    shipment,
    changes,
    options.eventMessage,
    options.eventLocation
  );

  if (!contexts.length) {
    return { customerSent: false, adminSent: false, contexts: 0 };
  }

  const result = await dispatchShipmentContexts(contexts, {
    notifyCustomer: options.notifyCustomer ?? true,
  });
  return { ...result, contexts: contexts.length };
}

async function dispatchShipmentContexts(
  contexts: ShipmentEmailContext[],
  options: { notifyCustomer: boolean }
): Promise<{ customerSent: boolean; adminSent: boolean }> {
  const admin = adminNotifyEmail();
  let customerSent = false;
  let adminSent = false;

  for (const ctx of contexts) {
    for (const email of getPartyNotificationEmails(ctx.shipment)) {
      if (shouldNotifyCustomer(ctx, options.notifyCustomer, email)) {
        const result = await sendEmailSafe(
          {
            to: email,
            subject: customerShipmentSubject(ctx),
            react: CustomerShipmentEmail({ ctx }),
          },
          { template: `customer/${ctx.kind}`, trackingNumber: ctx.shipment.trackingNumber }
        );
        if (result.emailSent) customerSent = true;
      }
    }

    if (shouldNotifyAdmin(ctx) && admin) {
      const result = await sendEmailSafe(
        {
          to: admin,
          subject: adminShipmentSubject(ctx),
          react: AdminShipmentEmail({ ctx }),
        },
        { template: `admin/${ctx.kind}`, trackingNumber: ctx.shipment.trackingNumber }
      );
      if (result.emailSent) adminSent = true;
    }
  }

  return { customerSent, adminSent };
}

export type { ShipmentChangeSet };
