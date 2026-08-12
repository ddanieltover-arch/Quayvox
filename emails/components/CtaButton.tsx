import type { CSSProperties, ReactNode } from 'react';
import { Button } from '@react-email/components';
import { BRAND, FONTS } from '../constants';

type CtaVariant = 'primary' | 'secondary' | 'danger';

const variants: Record<CtaVariant, CSSProperties> = {
  primary: {
    backgroundColor: BRAND.cobalt,
    color: '#FFFFFF',
    border: `1px solid ${BRAND.cobalt}`,
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    color: BRAND.textPrimary,
    border: `1px solid ${BRAND.border}`,
  },
  danger: {
    backgroundColor: BRAND.error,
    color: '#FFFFFF',
    border: `1px solid ${BRAND.error}`,
  },
};

export function CtaButton({
  href,
  label,
  variant = 'primary',
}: {
  href: string;
  label: string;
  variant?: CtaVariant;
}) {
  return (
    <Button
      href={href}
      style={{
        ...variants[variant],
        display: 'inline-block',
        padding: '14px 26px',
        borderRadius: '12px',
        fontFamily: FONTS.body,
        fontSize: '14px',
        fontWeight: 600,
        lineHeight: '20px',
        textDecoration: 'none',
        textAlign: 'center',
      }}
    >
      {label}
    </Button>
  );
}

export function CtaRow({ children }: { children: ReactNode }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ margin: '4px 0 8px' }}>
      <tbody>
        <tr>
          <td align="left" style={{ padding: '0 8px 12px 0' }}>
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
