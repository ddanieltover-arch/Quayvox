import { BRAND, FONTS } from './constants';

export const s = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: BRAND.bgCanvas,
    fontFamily: FONTS.body,
    WebkitFontSmoothing: 'antialiased' as const,
  },
  outerPad: {
    padding: '32px 12px 48px',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: BRAND.navyHeader,
    borderRadius: '20px',
    overflow: 'hidden' as const,
    border: `1px solid ${BRAND.borderOnDark}`,
  },
  header: {
    backgroundColor: BRAND.navyHeader,
    padding: '28px 36px 8px',
  },
  hero: {
    backgroundColor: BRAND.navyHeader,
    padding: '8px 36px 32px',
  },
  accentBar: {
    height: '3px',
    lineHeight: '3px',
    fontSize: '0',
  },
  bodyCard: {
    backgroundColor: BRAND.surface,
    padding: '32px 36px 28px',
  },
  footer: {
    backgroundColor: BRAND.navyDark,
    padding: '28px 36px 32px',
    borderTop: `1px solid ${BRAND.borderOnDark}`,
  },
  eyebrow: {
    margin: '0 0 10px',
    fontFamily: FONTS.mono,
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    color: BRAND.cobaltSoft,
  },
  headline: {
    margin: '0 0 12px',
    fontFamily: FONTS.display,
    fontSize: '26px',
    lineHeight: '34px',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    color: BRAND.textOnDark,
  },
  subhead: {
    margin: '0 0 18px',
    fontSize: '15px',
    lineHeight: '24px',
    color: BRAND.textMutedOnDark,
  },
  bodyText: {
    margin: '0 0 16px',
    fontSize: '15px',
    lineHeight: '24px',
    color: BRAND.textSecondary,
  },
  bodyTitle: {
    margin: '0 0 10px',
    fontFamily: FONTS.display,
    fontSize: '16px',
    lineHeight: '22px',
    fontWeight: 600,
    color: BRAND.textPrimary,
  },
  tracking: {
    fontFamily: FONTS.mono,
    fontSize: '13px',
    letterSpacing: '0.04em',
    color: BRAND.textOnDark,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: BRAND.textSecondary,
  },
} as const;
