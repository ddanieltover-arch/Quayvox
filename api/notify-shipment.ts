import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { isServerConfigured, requireAdmin } from './_lib/auth';
import { handleOptions } from './_lib/http';
import { getShipmentByTracking } from './_lib/shipments';
import { adminNotifyEmail, sendEmailSafe } from './_lib/mail';
import { rowToShipmentEmailData } from './_lib/shipmentNotifications';
import {
  AdminShipmentEmail,
  CustomerShipmentEmail,
  adminShipmentSubject,
  customerShipmentSubject,
} from '../emails/templates/ShipmentEmails';
import type { ShipmentEmailContext } from '../emails/types';

const bodySchema = z.object({
  trackingNumber: z.string().trim().min(3).max(64),
  status: z.string().trim().min(1).max(64).optional(),
  customerEmail: z.string().trim().email().optional(),
  notifyCustomer: z.boolean().optional(),
});

/** Legacy endpoint — prefer PATCH /api/shipments/:id which sends emails automatically. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res, 'POST, OPTIONS')) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isServerConfigured()) {
    return res.status(503).json({ error: 'Server is not configured' });
  }

  if (!requireAdmin(req, res)) return;

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const row = await getShipmentByTracking(parsed.data.trackingNumber);
  if (!row) {
    return res.status(404).json({ error: 'Shipment not found' });
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

  if ((parsed.data.notifyCustomer ?? true) && shipment.customerEmail) {
    const result = await sendEmailSafe({
      to: shipment.customerEmail,
      subject: customerShipmentSubject(ctx),
      react: CustomerShipmentEmail({ ctx }),
    });
    customerSent = result.emailSent;
  }

  if (admin) {
    const result = await sendEmailSafe({
      to: admin,
      subject: adminShipmentSubject(ctx),
      react: AdminShipmentEmail({ ctx }),
    });
    adminSent = result.emailSent;
  }

  return res.status(200).json({
    ok: true,
    emailSent: customerSent || adminSent,
    emails: { customerSent, adminSent },
  });
}
