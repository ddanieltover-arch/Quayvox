import type { ReactNode } from 'react';
import { Globe, Mail, Phone } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import {
  BRANCHES,
  CONTACT_EMAIL,
  CONTACT_MAILTO_HREF,
  CONTACT_PHONE_DISPLAY,
  CONTACT_TEL_HREF,
  CONTACT_WHATSAPP_HREF,
} from '@/lib/contact';

type ContactRowProps = {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  href?: string;
  external?: boolean;
};

const ContactRow = ({ icon, label, children, href, external }: ContactRowProps) => {
  const content = (
    <>
      <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-mono uppercase text-text-secondary mb-0.5">{label}</p>
        <div className="text-sm text-text-primary">{children}</div>
      </div>
    </>
  );

  const className =
    'flex items-center gap-4 rounded-xl bg-navy-800/60 border border-white/5 px-4 py-3.5 transition-colors';

  if (href) {
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={`${className} hover:border-cobalt/30 hover:bg-navy-800`}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
};

type ContactDetailsCardProps = {
  title?: string;
  subtitle?: string;
  className?: string;
};

const ContactDetailsCard = ({
  title = 'Reach us directly',
  subtitle = 'Prefer email, a call, or WhatsApp? We’ll route you to the right region.',
  className = '',
}: ContactDetailsCardProps) => (
  <div className={`card-surface p-5 sm:p-6 lg:p-8 ${className}`}>
    <h2 className="font-display font-semibold text-xl text-text-primary mb-2">{title}</h2>
    <p className="text-sm text-text-secondary leading-relaxed mb-6">{subtitle}</p>

    <div className="space-y-3">
      <ContactRow icon={<Mail className="w-5 h-5 text-cobalt" />} label="Email" href={CONTACT_MAILTO_HREF}>
        {CONTACT_EMAIL}
      </ContactRow>

      <ContactRow
        icon={<Phone className="w-5 h-5 text-cobalt" />}
        label="Phone"
        href={CONTACT_TEL_HREF}
      >
        {CONTACT_PHONE_DISPLAY}
      </ContactRow>

      <ContactRow
        icon={<WhatsAppIcon className="h-5 w-5 shrink-0 text-cobalt" />}
        label="WhatsApp"
        href={CONTACT_WHATSAPP_HREF}
        external
      >
        {CONTACT_PHONE_DISPLAY}
      </ContactRow>

      <ContactRow icon={<Globe className="w-5 h-5 text-cobalt" />} label="Global branches">
        <p>{BRANCHES.map((b) => b.country).join(' · ')}</p>
        <p className="text-xs text-text-secondary mt-1">Branches across every continent</p>
      </ContactRow>
    </div>
  </div>
);

export default ContactDetailsCard;
