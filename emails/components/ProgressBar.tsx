import { Text } from '@react-email/components';
import { BRAND, FONTS } from '../constants';

export function ProgressBar({
  progress,
  accent = BRAND.cobalt,
}: {
  progress: number;
  accent?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  const rest = 100 - pct;

  return (
    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ margin: '0 0 20px' }}>
      <tbody>
        <tr>
          <td>
            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
              <tbody>
                <tr>
                  <td>
                    <Text
                      style={{
                        margin: 0,
                        fontFamily: FONTS.mono,
                        fontSize: '10px',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: BRAND.textSecondary,
                      }}
                    >
                      Progress
                    </Text>
                  </td>
                  <td align="right">
                    <Text
                      style={{
                        margin: 0,
                        fontFamily: FONTS.mono,
                        fontSize: '12px',
                        fontWeight: 500,
                        color: BRAND.textPrimary,
                      }}
                    >
                      {pct}%
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              role="presentation"
              style={{ marginTop: '8px', borderRadius: '999px', overflow: 'hidden' }}
            >
              <tbody>
                <tr>
                  {pct > 0 ? (
                    <td
                      width={`${pct}%`}
                      height={8}
                      style={{
                        backgroundColor: accent,
                        height: '8px',
                        fontSize: 0,
                        lineHeight: '8px',
                      }}
                    >
                      &nbsp;
                    </td>
                  ) : null}
                  {rest > 0 ? (
                    <td
                      width={`${rest}%`}
                      height={8}
                      style={{
                        backgroundColor: BRAND.border,
                        height: '8px',
                        fontSize: 0,
                        lineHeight: '8px',
                      }}
                    >
                      &nbsp;
                    </td>
                  ) : null}
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
