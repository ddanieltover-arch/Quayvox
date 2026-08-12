import { appUrl } from '../constants';
import { QuayvoxLayout } from '../layout/QuayvoxLayout';
import { CtaButton, CtaRow } from '../components/CtaButton';
import { Callout } from '../components/ShipmentFacts';

export function AdminEmailDeliveryFailed({
  template,
  recipient,
  trackingNumber,
  errorMessage,
}: {
  template: string;
  recipient: string;
  trackingNumber?: string;
  errorMessage?: string;
}) {
  return (
    <QuayvoxLayout
      preview="A transactional email failed to send"
      audience="admin"
      tone="danger"
      eyebrow="Delivery failure"
      headline="A customer email did not send"
      subhead="Resend rejected or failed this message. Check the recipient, domain verification, and the error below."
    >
      <Callout title="Template" body={template} tone="danger" />
      <Callout title="Recipient" body={recipient} />
      {trackingNumber ? <Callout title="Tracking" body={trackingNumber} /> : null}
      {errorMessage ? <Callout title="Error" body={errorMessage} tone="danger" /> : null}
      <CtaRow>
        <CtaButton href={appUrl('/admin')} label="Open admin" variant="danger" />
      </CtaRow>
    </QuayvoxLayout>
  );
}
