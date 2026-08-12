import { Resend } from 'resend';
import type { ReactElement } from 'react';
import { render } from '@react-email/render';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  emailSent: boolean;
  id?: string;
  error?: string;
}

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || 'Quayvox <info@quayvox.com>';
}

export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function adminNotifyEmail(): string | null {
  return process.env.ADMIN_EMAIL || process.env.CONTACT_TO_EMAIL || null;
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return { ok: true, emailSent: false, error: 'RESEND_API_KEY missing' };
  }

  const to = Array.isArray(options.to) ? options.to : [options.to];
  if (!to.length || !to[0]) {
    return { ok: false, emailSent: false, error: 'No recipient' };
  }

  try {
    const html = await render(options.react);
    const resend = new Resend(resendKey);
    const result = await resend.emails.send({
      from: fromAddress(),
      to,
      subject: options.subject,
      html,
      replyTo: options.replyTo,
    });

    if (result.error) {
      return { ok: false, emailSent: false, error: result.error.message };
    }

    return { ok: true, emailSent: true, id: result.data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    console.error('sendEmail', err);
    return { ok: false, emailSent: false, error: message };
  }
}

export async function sendEmailSafe(
  options: SendEmailOptions,
  meta?: { template: string; trackingNumber?: string }
): Promise<SendEmailResult> {
  const result = await sendEmail(options);
  if (!result.emailSent && result.error && isMailConfigured()) {
    const admin = adminNotifyEmail();
    if (admin) {
      const { AdminEmailDeliveryFailed } = await import('../../emails/templates/SystemEmails');
      await sendEmail({
        to: admin,
        subject: '[Admin] Email delivery failed',
        react: AdminEmailDeliveryFailed({
          template: meta?.template ?? options.subject,
          recipient: Array.isArray(options.to) ? options.to.join(', ') : options.to,
          trackingNumber: meta?.trackingNumber,
          errorMessage: result.error,
        }),
      });
    }
  }
  return result;
}
