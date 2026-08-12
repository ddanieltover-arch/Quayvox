import { Text } from '@react-email/components';
import { BRAND, FONTS } from '../constants';
import type { ShipmentEmailData } from '../types';

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <td width="50%" valign="top" style={{ padding: '0 6px 12px' }}>
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        role="presentation"
        style={{
          backgroundColor: BRAND.bgLight,
          borderRadius: '12px',
          border: `1px solid ${BRAND.border}`,
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: '14px 16px' }}>
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
                {label}
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONTS.display,
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '20px',
                  color: BRAND.textPrimary,
                }}
              >
                {value}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  );
}

export function MetricGrid({
  shipment,
  extra,
}: {
  shipment: ShipmentEmailData;
  extra?: Array<{ label: string; value: string }>;
}) {
  const items = [
    { label: 'Mode', value: shipment.mode },
    { label: 'Carrier', value: shipment.carrier },
    { label: 'Priority', value: shipment.priority },
    { label: 'ETA', value: shipment.eta || 'TBC' },
    ...(extra ?? []),
  ];

  const rows: Array<typeof items> = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ margin: '0 0 8px' }}>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            {row.map((item) => (
              <Metric key={item.label} label={item.label} value={item.value} />
            ))}
            {row.length === 1 ? <td width="50%" /> : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Callout({
  title,
  body,
  tone = 'default',
}: {
  title: string;
  body: string;
  tone?: 'default' | 'danger';
}) {
  const border = tone === 'danger' ? BRAND.error : BRAND.cobalt;
  const bg = tone === 'danger' ? '#FEF2F2' : BRAND.bgLight;

  return (
    <table
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      role="presentation"
      style={{
        margin: '0 0 20px',
        backgroundColor: bg,
        borderRadius: '12px',
        borderLeft: `4px solid ${border}`,
      }}
    >
      <tbody>
        <tr>
          <td style={{ padding: '14px 18px' }}>
            <Text
              style={{
                margin: '0 0 4px',
                fontFamily: FONTS.mono,
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: tone === 'danger' ? BRAND.error : BRAND.textSecondary,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: '22px',
                color: BRAND.textPrimary,
                whiteSpace: 'pre-wrap',
              }}
            >
              {body}
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function DetailBlock({ title, body }: { title: string; body: string }) {
  return <Callout title={title} body={body} />;
}

export function ShipmentFacts({
  shipment,
  extraRows,
}: {
  shipment: ShipmentEmailData;
  extraRows?: Array<{ label: string; value: string }>;
}) {
  return <MetricGrid shipment={shipment} extra={extraRows} />;
}
