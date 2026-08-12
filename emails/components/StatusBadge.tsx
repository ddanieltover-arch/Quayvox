import { Text } from '@react-email/components';
import { FONTS, STATUS_COLORS, STATUS_COLORS_ON_DARK, type ShipmentStatus } from '../constants';

export function StatusBadge({
  status,
  onDark = false,
}: {
  status: ShipmentStatus;
  onDark?: boolean;
}) {
  const colors = onDark
    ? (STATUS_COLORS_ON_DARK[status] ?? STATUS_COLORS_ON_DARK.Pending)
    : (STATUS_COLORS[status] ?? STATUS_COLORS.Pending);

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '5px 11px',
        borderRadius: '999px',
        fontFamily: FONTS.mono,
        fontSize: '11px',
        fontWeight: 500,
        lineHeight: '16px',
        letterSpacing: '0.04em',
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {status}
    </span>
  );
}

export function AudienceBadge({ label }: { label: string }) {
  return (
    <Text
      style={{
        margin: 0,
        display: 'inline-block',
        padding: '5px 10px',
        borderRadius: '999px',
        fontFamily: FONTS.mono,
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#A5B4FC',
        border: '1px solid rgba(79, 109, 245, 0.38)',
        backgroundColor: 'rgba(79, 109, 245, 0.12)',
      }}
    >
      {label}
    </Text>
  );
}
