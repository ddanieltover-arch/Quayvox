import { Link, Text } from '@react-email/components';
import { BRANCHES_LINE, BRAND, CONTACT, FONTS, appUrl } from '../constants';

export function EmailFooter({ showUnsubscribe = false }: { showUnsubscribe?: boolean }) {
  const link = {
    color: BRAND.cobaltSoft,
    textDecoration: 'none',
    fontWeight: 500,
  };

  const muted = {
    color: BRAND.textMutedOnDark,
    textDecoration: 'none',
  };

  return (
    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
      <tbody>
        <tr>
          <td>
            <Text
              style={{
                margin: '0 0 6px',
                fontFamily: FONTS.display,
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              <span style={{ color: BRAND.textOnDark }}>Quay</span>
              <span style={{ color: BRAND.cobalt }}>vox</span>
            </Text>
            <Text
              style={{
                margin: '0 0 18px',
                fontSize: '12px',
                lineHeight: '18px',
                color: BRAND.textMutedOnDark,
              }}
            >
              Global freight visibility — ocean, air, rail, and road.
            </Text>
            <Text
              style={{
                margin: '0 0 6px',
                fontFamily: FONTS.mono,
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: BRAND.textMutedOnDark,
              }}
            >
              Contact
            </Text>
            <Text style={{ margin: '0 0 16px', fontSize: '13px', lineHeight: '22px', color: BRAND.textMutedOnDark }}>
              <Link href={CONTACT.mailtoHref} style={link}>
                {CONTACT.email}
              </Link>
              {'  ·  '}
              <Link href={CONTACT.telHref} style={link}>
                {CONTACT.phoneDisplay}
              </Link>
              {'  ·  '}
              <Link href={CONTACT.whatsappHref} style={link}>
                WhatsApp
              </Link>
            </Text>
            <Text
              style={{
                margin: '0 0 6px',
                fontFamily: FONTS.mono,
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: BRAND.textMutedOnDark,
              }}
            >
              Branches
            </Text>
            <Text style={{ margin: '0 0 20px', fontSize: '12px', lineHeight: '20px', color: BRAND.textMutedOnDark }}>
              {BRANCHES_LINE}
            </Text>
            <Text style={{ margin: 0, fontSize: '11px', lineHeight: '18px', color: BRAND.textMutedOnDark }}>
              <Link href={appUrl('/privacy')} style={muted}>
                Privacy
              </Link>
              {'  ·  '}
              <Link href={appUrl('/terms')} style={muted}>
                Terms
              </Link>
              {showUnsubscribe ? (
                <>
                  {'  ·  '}
                  <Link href={appUrl('/contact')} style={muted}>
                    Unsubscribe
                  </Link>
                </>
              ) : null}
              {'  ·  '}© {new Date().getFullYear()} Quayvox
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
