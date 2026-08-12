import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { isDbConfigured } from '../db';
import { handleOptions } from '../http';
import { sendContactEmails } from '../notify';
import { insertContactMessage } from '../shipments';

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(160).optional().nullable(),
  message: z.string().trim().min(5).max(5000),
  website: z.string().optional().nullable(),
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

export async function handleContact(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handleOptions(req, res, 'POST, OPTIONS')) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';

  if (!rateLimit(ip)) {
    res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    return;
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid form data', details: parsed.error.flatten() });
    return;
  }

  const { name, email, company, message, website } = parsed.data;

  if (website) {
    res.status(200).json({ ok: true });
    return;
  }

  if (!isDbConfigured()) {
    res.status(500).json({ error: 'Server database is not configured' });
    return;
  }

  try {
    await insertContactMessage({
      name,
      email,
      company: company || null,
      message,
    });
  } catch (err) {
    console.error('contact insert', err);
    res.status(500).json({ error: 'Failed to save message' });
    return;
  }

  const { customerSent, adminSent } = await sendContactEmails({
    name,
    email,
    company: company || null,
    message,
  });

  res.status(200).json({
    ok: true,
    emailSent: adminSent,
    customerConfirmationSent: customerSent,
  });
}
