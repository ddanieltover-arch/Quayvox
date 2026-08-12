import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import {
  AdminShipmentEmail,
  CustomerShipmentEmail,
  adminShipmentSubject,
  customerShipmentSubject,
} from '../../../emails/templates/ShipmentEmails';
import type { ShipmentEmailContext } from '../../../emails/types';
import { isServerConfigured, requireAdmin } from '../auth';
import { handleOptions } from '../http';
import { adminNotifyEmail, sendEmailSafe } from '../mail';
import { getShipmentByTracking } from '../shipments';
import { rowToShipmentEmailData, getPartyNotificationEmails } from '../shipmentNotifications';

const bodySchema = z.object({
  trackingNumber: z.string().trim().min(3).max(64),
  status: z.string().trim().min(1).max(64).optional(),
  customerEmail: z.string().trim().email().optional(),
  notifyCustomer: z.boolean().optional(),
});

/** Legacy endpoint — prefer PATCH /api/shipments/:id which sends emails automatically. */
export async function handleNotifyShipment(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handleOptions(req, res, 'POST, OPTIONS')) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isServerConfigured()) {
    res.status(503).json({ error: 'Server is not configured' });
    return;
  }

  if (!requireAdmin(req, res)) return;

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  const row = await getShipmentByTracking(parsed.data.trackingNumber);
  if (!row) {
    res.status(404).json({ error: 'Shipment not found' });
    return;
  }

  const shipment = rowToShipmentEmailData({
    ...row,
    customer_email: parsed.data.customerEmail ?? row.customer_email,
    status: parsed.data.status ?? row.status,
  });

  const ctx: ShipmentEmailContext = {
    shipment,
    kind: 'status',
    eventMessage: parsed.data.status ? `Status updated to ${parsed.data.status}` : undefined,
  };

  const admin = adminNotifyEmail();
  let customerSent = false;
  let adminSent = false;

  for (const email of getPartyNotificationEmails(shipment)) {
    const result = await sendEmailSafe({
      to: email,
      subject: customerShipmentSubject(ctx),
      react: CustomerShipmentEmail({ ctx }),
    });
    if (result.emailSent) customerSent = true;
  }

  if (admin) {
    const result = await sendEmailSafe({
      to: admin,
      subject: adminShipmentSubject(ctx),
      react: AdminShipmentEmail({ ctx }),
    });
    adminSent = result.emailSent;
  }

  res.status(200).json({
    ok: true,
    emailSent: customerSent || adminSent,
    emails: { customerSent, adminSent },
  });
}
