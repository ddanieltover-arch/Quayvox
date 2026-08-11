import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { z } from 'zod';
import { isServerConfigured, requireAdmin } from './_lib/auth';
import { handleOptions } from './_lib/http';

const bodySchema = z.object({
  trackingNumber: z.string().trim().min(3).max(64),
  status: z.string().trim().min(1).max(64),
  customerEmail: z.string().trim().email(),
  origin: z.string().optional(),
  destination: z.string().optional(),
});

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

  const { trackingNumber, status, customerEmail, origin, destination } = parsed.data;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Quayvox <onboarding@resend.dev>';

  if (!resendKey) {
    return res.status(200).json({ ok: true, emailSent: false, reason: 'RESEND_API_KEY missing' });
  }

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: fromEmail,
      to: [customerEmail],
      subject: `Shipment ${trackingNumber} is now ${status}`,
      text: [
        `Your shipment ${trackingNumber} status is now: ${status}.`,
        origin && destination ? `Route: ${origin} → ${destination}` : '',
        '',
        `Track online: ${process.env.PUBLIC_APP_URL || 'https://www.quayvox.com'}/track/${encodeURIComponent(trackingNumber)}`,
      ]
        .filter(Boolean)
        .join('\n'),
    });
    return res.status(200).json({ ok: true, emailSent: true });
  } catch (err) {
    console.error('notify-shipment', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
