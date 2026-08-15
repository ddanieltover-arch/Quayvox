import type { ReactElement } from 'react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import {
  AdminContactReceived,
  CustomerContactConfirmation,
} from '../emails/templates/ContactEmails';
import {
  AdminShipmentEmail,
  CustomerShipmentEmail,
  adminShipmentSubject,
  customerShipmentSubject,
} from '../emails/templates/ShipmentEmails';
import { AdminEmailDeliveryFailed } from '../emails/templates/SystemEmails';
import type { ShipmentEmailContext, ShipmentEmailData } from '../emails/types';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  try {
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env optional when vars are already set
  }
}

const sampleShipment: ShipmentEmailData = {
  id: 'test-shipment-id',
  trackingNumber: 'SH-2026-7847',
  status: 'In Transit',
  origin: 'Mumbai, IN',
  destination: 'Nairobi, KE',
  carrier: 'Maersk',
  mode: 'Ocean',
  priority: 'Standard',
  eta: '2026-09-15',
  progress: 62,
  shipper: 'Acme Exports',
  consignee: 'East Africa Trading',
  customerEmail: 'customer@example.com',
  currentLat: 12.45,
  currentLng: 45.12,
  positionLabel: 'Arabian Sea',
};

const statuses = ['Pending', 'In Transit', 'Customs', 'On Hold', 'Delivered', 'Exception'] as const;

async function send(to: string, subject: string, react: ReactElement) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'Quayvox <info@quayvox.com>';
  if (!key) throw new Error('RESEND_API_KEY is not set in .env');

  const html = await render(react);
  const resend = new Resend(key);
  const result = await resend.emails.send({ from, to, subject, html });
  if (result.error) throw new Error(result.error.message);
  console.log(`  ✓ ${subject}`);
}

async function main() {
  loadEnv();
  const to = process.env.EMAIL_TEST_TO || process.env.ADMIN_EMAIL;
  if (!to) {
    console.error('Set EMAIL_TEST_TO or ADMIN_EMAIL in .env');
    process.exit(1);
  }

  console.log(`Sending Quayvox email template tests to ${to}...\n`);

  const contact = {
    name: 'Test User',
    email: 'visitor@example.com',
    company: 'Pulse Software Studio',
    message: 'This is a test contact message from the email template QA script.',
  };

  await send(to, 'We received your message — Quayvox', CustomerContactConfirmation({ data: contact }));
  await send(to, `Quayvox contact from ${contact.name}`, AdminContactReceived({ data: contact }));

  const createdCtx: ShipmentEmailContext = { shipment: sampleShipment, kind: 'created' };
  await send(to, customerShipmentSubject(createdCtx), CustomerShipmentEmail({ ctx: createdCtx }));
  await send(to, adminShipmentSubject(createdCtx), AdminShipmentEmail({ ctx: createdCtx }));

  for (const status of statuses) {
    const shipment = { ...sampleShipment, status };
    const ctx: ShipmentEmailContext = {
      shipment,
      kind: 'status',
      previousStatus: 'Pending',
    };
    await send(to, customerShipmentSubject(ctx), CustomerShipmentEmail({ ctx }));
    await send(to, adminShipmentSubject(ctx), AdminShipmentEmail({ ctx }));
  }

  const locationCtx: ShipmentEmailContext = {
    shipment: sampleShipment,
    kind: 'location',
    eventLocation: 'Arabian Sea',
  };
  await send(to, customerShipmentSubject(locationCtx), CustomerShipmentEmail({ ctx: locationCtx }));
  await send(to, adminShipmentSubject(locationCtx), AdminShipmentEmail({ ctx: locationCtx }));

  const etaCtx: ShipmentEmailContext = {
    shipment: sampleShipment,
    kind: 'eta',
    previousEta: '2026-09-01',
  };
  await send(to, customerShipmentSubject(etaCtx), CustomerShipmentEmail({ ctx: etaCtx }));
  await send(to, adminShipmentSubject(etaCtx), AdminShipmentEmail({ ctx: etaCtx }));

  const timelineCtx: ShipmentEmailContext = {
    shipment: sampleShipment,
    kind: 'timeline',
    eventMessage: 'Documentation received at hub',
    eventLocation: 'Dubai, AE',
  };
  await send(to, customerShipmentSubject(timelineCtx), CustomerShipmentEmail({ ctx: timelineCtx }));
  await send(to, adminShipmentSubject(timelineCtx), AdminShipmentEmail({ ctx: timelineCtx }));

  await send(
    to,
    '[Admin] Email delivery failed',
    AdminEmailDeliveryFailed({
      template: 'customer/status',
      recipient: 'bad@invalid',
      trackingNumber: sampleShipment.trackingNumber,
      errorMessage: 'Simulated delivery failure for QA',
    })
  );

  console.log('\nDone — check your inbox.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
