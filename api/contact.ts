import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { z } from 'zod';
import { isDbConfigured } from './_lib/db';
import { handleOptions } from './_lib/http';
import { insertContactMessage } from './_lib/shipments';

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
  if (handleOptions(req, res, 'POST, OPTIONS')) return;
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

  if (website) {
    return res.status(200).json({ ok: true });
  }

  if (!isDbConfigured()) {
    return res.status(500).json({ error: 'Server database is not configured' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Quayvox <onboarding@resend.dev>';
  const toEmail = process.env.CONTACT_TO_EMAIL;

  try {
    await insertContactMessage({
      name,
      email,
      company: company || null,
      message,
    });
  } catch (err) {
    console.error('contact insert', err);
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
      return res.status(200).json({ ok: true, emailSent: false });
    }
  }

  return res.status(200).json({ ok: true, emailSent: Boolean(resendKey && toEmail) });
}
