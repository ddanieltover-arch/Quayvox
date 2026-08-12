import { Text } from '@react-email/components';
import { BRAND, FONTS } from '../constants';

function cityLine(place: string): { city: string; rest: string } {
  const [city, ...rest] = place.split(',').map((p) => p.trim());
  return { city: city || place, rest: rest.join(', ') };
}

export function RouteCard({ origin, destination }: { origin: string; destination: string }) {
  const from = cityLine(origin);
  const to = cityLine(destination);

  return (
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
          <td style={{ padding: '20px 22px 18px' }}>
            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
              <tbody>
                <tr>
                  <td width="46%" valign="top">
                    <Text
                      style={{
                        margin: '0 0 4px',
                        fontFamily: FONTS.mono,
                        fontSize: '10px',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: BRAND.textSecondary,
                      }}
                    >
                      Origin
                    </Text>
                    <Text
                      style={{
                        margin: 0,
                        fontFamily: FONTS.display,
                        fontSize: '16px',
                        fontWeight: 600,
                        lineHeight: '22px',
                        color: BRAND.textPrimary,
                      }}
                    >
                      {from.city}
                    </Text>
                    {from.rest ? (
                      <Text style={{ margin: '2px 0 0', fontSize: '12px', color: BRAND.textSecondary }}>
                        {from.rest}
                      </Text>
                    ) : null}
                  </td>
                  <td width="8%" align="center" valign="middle">
                    <Text
                      style={{
                        margin: 0,
                        fontSize: '18px',
                        color: BRAND.cobalt,
                        lineHeight: '18px',
                      }}
                    >
                      →
                    </Text>
                  </td>
                  <td width="46%" align="right" valign="top">
                    <Text
                      style={{
                        margin: '0 0 4px',
                        fontFamily: FONTS.mono,
                        fontSize: '10px',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: BRAND.textSecondary,
                      }}
                    >
                      Destination
                    </Text>
                    <Text
                      style={{
                        margin: 0,
                        fontFamily: FONTS.display,
                        fontSize: '16px',
                        fontWeight: 600,
                        lineHeight: '22px',
                        color: BRAND.textPrimary,
                      }}
                    >
                      {to.city}
                    </Text>
                    {to.rest ? (
                      <Text style={{ margin: '2px 0 0', fontSize: '12px', color: BRAND.textSecondary }}>
                        {to.rest}
                      </Text>
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>
            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ marginTop: '16px' }}>
              <tbody>
                <tr>
                  <td width="12" height="12" bgcolor={BRAND.cobalt} style={{ borderRadius: '50%', fontSize: 0, lineHeight: '12px' }}>
                    &nbsp;
                  </td>
                  <td height="12" style={{ padding: '0 6px' }}>
                    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                      <tbody>
                        <tr>
                          <td height="2" bgcolor={BRAND.cobalt} style={{ fontSize: 0, lineHeight: '2px' }}>
                            &nbsp;
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td
                    width="12"
                    height="12"
                    bgcolor="#FFFFFF"
                    style={{
                      borderRadius: '50%',
                      border: `2px solid ${BRAND.cobalt}`,
                      fontSize: 0,
                      lineHeight: '12px',
                    }}
                  >
                    &nbsp;
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
