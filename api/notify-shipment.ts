import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { z } from 'zod';

const bodySchema = z.object({
  trackingNumber: z.string().trim().min(3).max(64),
  status: z.string().trim().min(1).max(64),
  customerEmail: z.string().trim().email(),
  origin: z.string().optional(),
  destination: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Quayvox <onboarding@resend.dev>';

  if (!supabaseUrl || !anonKey) {
    return res.status(500).json({ error: 'Server auth is not configured' });
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const { trackingNumber, status, customerEmail, origin, destination } = parsed.data;

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
