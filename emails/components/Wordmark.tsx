import { Text } from '@react-email/components';
import { BRAND, FONTS } from '../constants';

export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <Text
      style={{
        margin: 0,
        fontFamily: FONTS.display,
        fontSize: `${size}px`,
        fontWeight: 700,
        lineHeight: `${size + 6}px`,
        letterSpacing: '-0.03em',
      }}
    >
      <span style={{ color: BRAND.textOnDark }}>Quay</span>
      <span style={{ color: BRAND.cobalt }}>vox</span>
    </Text>
  );
}
