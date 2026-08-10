import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { z } from 'zod';

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(160).optional().nullable(),
  message: z.string().trim().min(5).max(5000),
  website: z.string().optional().nullable(), // honeypot
});

const rateMap = new Map<string, { count: number; reset: number }>();

function rateLimit(ip: string, limit = 8, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';

  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid form data', details: parsed.error.flatten() });
  }

  const { name, email, company, message, website } = parsed.data;

  // Honeypot: bots fill hidden field
  if (website) {
    return res.status(200).json({ ok: true });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Quayvox <onboarding@resend.dev>';
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Server database is not configured' });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { error: dbError } = await supabase.from('contact_messages').insert({
    name,
    email,
    company: company || null,
    message,
  });

  if (dbError) {
    console.error('contact insert', dbError);
    return res.status(500).json({ error: 'Failed to save message' });
  }

  if (resendKey && toEmail) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        replyTo: email,
        subject: `Quayvox contact from ${name}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Company: ${company || '—'}`,
          '',
          message,
        ].join('\n'),
      });
    } catch (err) {
      console.error('resend contact', err);
      // Message is stored; still return success with warning
      return res.status(200).json({ ok: true, emailSent: false });
    }
  }

  return res.status(200).json({ ok: true, emailSent: Boolean(resendKey && toEmail) });
}
