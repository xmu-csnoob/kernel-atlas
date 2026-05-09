import React from 'react';
import { color, font, space, radius } from '../../../design/tokens';

interface RingBoundaryBannerProps {
  fromLabel?: string;
  fromRing?: string;
  toLabel?: string;
  toRing?: string;
  arrowLabel?: string;
}

const RingBoundaryBanner: React.FC<RingBoundaryBannerProps> = ({
  fromLabel = 'USER',
  fromRing = 'ring 3',
  toLabel = 'KERNEL',
  toRing = 'ring 0',
  arrowLabel = 'syscall',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space[3],
        padding: `${space[2]} ${space[4]}`,
        background: 'rgba(77, 208, 225, 0.06)',
        border: `1px dashed ${color.accent.primary}55`,
        borderRadius: radius.md,
        fontFamily: font.family.mono,
        fontSize: font.size.xs,
        color: color.accent.primary,
        letterSpacing: '0.05em',
      }}
    >
      <span>{fromLabel} ({fromRing})</span>
      <span style={{ fontSize: '14px' }}>
        ━━━ {arrowLabel} ━━━▶
      </span>
      <span>{toLabel} ({toRing})</span>
    </div>
  );
};

export default RingBoundaryBanner;
