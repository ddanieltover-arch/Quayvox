import { Text } from '@react-email/components';
import { BRAND, CONTACT, FONTS, appUrl } from '../constants';
import { QuayvoxLayout } from '../layout/QuayvoxLayout';
import { CtaButton, CtaRow } from '../components/CtaButton';
import { Callout } from '../components/ShipmentFacts';
import type { ContactEmailData } from '../types';

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td
        style={{
          padding: '10px 0',
          width: '34%',
          fontFamily: FONTS.mono,
          fontSize: '10px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: BRAND.textSecondary,
          verticalAlign: 'top',
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: '10px 0',
          fontFamily: FONTS.body,
          fontSize: '14px',
          fontWeight: 500,
          color: BRAND.textPrimary,
          verticalAlign: 'top',
        }}
      >
        {value}
      </td>
    </tr>
  );
}

export function CustomerContactConfirmation({ data }: { data: ContactEmailData }) {
  return (
    <QuayvoxLayout
      preview="We received your message — the Quayvox team will reply shortly"
      audience="customer"
      tone="default"
      eyebrow="Message received"
      headline={`Thanks, ${data.name.split(' ')[0] || data.name}.`}
      subhead="A member of the Quayvox team will reply by email. If this is time-critical, call or WhatsApp us using the details below."
    >
      <Callout title="Your message" body={data.message} />
      <CtaRow>
        <CtaButton href={appUrl('/track')} label="Track a shipment" />
      </CtaRow>
      <CtaRow>
        <CtaButton href={CONTACT.whatsappHref} label="WhatsApp the team" variant="secondary" />
      </CtaRow>
      <Text style={{ margin: '0 0 24px', fontSize: '13px', lineHeight: '20px', color: BRAND.textSecondary }}>
        {CONTACT.email} · {CONTACT.phoneDisplay}
      </Text>
    </QuayvoxLayout>
  );
}

export function AdminContactReceived({ data }: { data: ContactEmailData }) {
  return (
    <QuayvoxLayout
      preview={`New contact from ${data.name}${data.company ? ` · ${data.company}` : ''}`}
      audience="admin"
      tone="default"
      eyebrow="New inquiry"
      headline="A visitor wrote in from quayvox.com"
      subhead="Reply from this thread to keep the conversation in one place."
    >
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        role="presentation"
        style={{
          margin: '0 0 16px',
          backgroundColor: BRAND.bgLight,
          borderRadius: '14px',
          border: `1px solid ${BRAND.border}`,
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: '8px 20px' }}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tbody>
                  <IdentityRow label="Name" value={data.name} />
                  <IdentityRow label="Email" value={data.email} />
                  {data.company ? <IdentityRow label="Company" value={data.company} /> : null}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <Callout title="Message" body={data.message} />
      <CtaRow>
        <CtaButton href={`mailto:${data.email}`} label="Reply to sender" />
      </CtaRow>
    </QuayvoxLayout>
  );
}
