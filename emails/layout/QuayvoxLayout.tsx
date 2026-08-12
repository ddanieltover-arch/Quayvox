import type { ReactNode } from 'react';
import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components';
import { BRAND, FONTS, TONE_ACCENT, type EmailAudience, type EmailTone } from '../constants';
import { EmailFooter } from '../components/Footer';
import { AudienceBadge } from '../components/StatusBadge';
import { Wordmark } from '../components/Wordmark';
import { s } from '../styles';

export function QuayvoxLayout({
  preview,
  audience = 'customer',
  tone = 'default',
  eyebrow,
  headline,
  subhead,
  headerMeta,
  children,
  showUnsubscribe = false,
}: {
  preview: string;
  audience?: EmailAudience;
  tone?: EmailTone;
  eyebrow?: string;
  headline: string;
  subhead?: string;
  headerMeta?: ReactNode;
  children: ReactNode;
  showUnsubscribe?: boolean;
}) {
  const accent = TONE_ACCENT[tone];
  const audienceLabel = audience === 'admin' ? 'Operations' : 'Tracking';

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={s.body}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <Section style={s.header}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tbody>
                  <tr>
                    <td align="left" valign="middle">
                      <Wordmark />
                    </td>
                    <td align="right" valign="middle">
                      <AudienceBadge label={audienceLabel} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section style={s.hero}>
              {eyebrow ? (
                <Text style={{ ...s.eyebrow, color: accent }}>{eyebrow}</Text>
              ) : null}
              <Text
                style={{
                  ...s.headline,
                  color: tone === 'danger' ? '#FCA5A5' : BRAND.textOnDark,
                }}
              >
                {headline}
              </Text>
              {subhead ? <Text style={s.subhead}>{subhead}</Text> : null}
              {headerMeta ? (
                <table cellPadding={0} cellSpacing={0} role="presentation">
                  <tbody>
                    <tr>
                      <td>{headerMeta}</td>
                    </tr>
                  </tbody>
                </table>
              ) : null}
            </Section>

            <Section style={{ ...s.accentBar, backgroundColor: accent }}>&nbsp;</Section>

            <Section style={s.bodyCard}>{children}</Section>

            <Section style={s.footer}>
              <EmailFooter showUnsubscribe={showUnsubscribe} />
            </Section>
          </Container>

          <Text
            style={{
              margin: '16px 0 0',
              textAlign: 'center',
              fontFamily: FONTS.body,
              fontSize: '11px',
              color: BRAND.textMutedOnDark,
            }}
          >
            This is a transactional message from Quayvox.
          </Text>
        </Section>
      </Body>
    </Html>
  );
}
