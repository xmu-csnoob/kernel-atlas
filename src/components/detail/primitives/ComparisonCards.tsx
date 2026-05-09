import React from 'react';
import { color, font, space, radius } from '../../../design/tokens';
import type { Region } from '../../../design/tokens';
import { regionPalette } from '../../../design/tokens';

interface SideCard {
  title: string;
  region: Region;
  content: React.ReactNode;
  badge?: string;
}

interface ComparisonCardsProps {
  left: SideCard;
  right: SideCard;
  dividerLabel?: string;
}

const ComparisonCards: React.FC<ComparisonCardsProps> = ({
  left,
  right,
  dividerLabel,
}) => {
  const leftPalette = regionPalette(left.region);
  const rightPalette = regionPalette(right.region);

  return (
    <div
      style={{
        display: 'flex',
        gap: space[4],
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'stretch',
      }}
    >
      <div
        style={{
          background: leftPalette.bg,
          border: `1px solid ${leftPalette.fg}55`,
          borderRadius: radius.md,
          padding: space[4],
          flex: 1,
          minWidth: '200px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.lg,
            color: leftPalette.fg,
            fontWeight: 700,
            marginBottom: space[2],
          }}
        >
          {left.title}
        </div>
        {left.badge && (
          <div
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: leftPalette.accent,
              marginBottom: space[2],
            }}
          >
            {left.badge}
          </div>
        )}
        <div
          style={{
            fontFamily: font.family.sans,
            fontSize: font.size.sm,
            color: color.text.secondary,
            lineHeight: 1.5,
          }}
        >
          {left.content}
        </div>
      </div>

      {dividerLabel && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.dim,
            padding: `0 ${space[2]}`,
          }}
        >
          {dividerLabel}
        </div>
      )}

      <div
        style={{
          background: rightPalette.bg,
          border: `1px solid ${rightPalette.fg}55`,
          borderRadius: radius.md,
          padding: space[4],
          flex: 1,
          minWidth: '200px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.lg,
            color: rightPalette.fg,
            fontWeight: 700,
            marginBottom: space[2],
          }}
        >
          {right.title}
        </div>
        {right.badge && (
          <div
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: rightPalette.accent,
              marginBottom: space[2],
            }}
          >
            {right.badge}
          </div>
        )}
        <div
          style={{
            fontFamily: font.family.sans,
            fontSize: font.size.sm,
            color: color.text.secondary,
            lineHeight: 1.5,
          }}
        >
          {right.content}
        </div>
      </div>
    </div>
  );
};

export default ComparisonCards;
