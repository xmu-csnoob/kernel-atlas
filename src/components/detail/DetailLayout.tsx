import React from 'react';
import type { MainFlowNode } from '../../data/types';
import type { Region } from '../../design/tokens';
import { color, font, space, radius, regionPalette, REGION_LABEL } from '../../design/tokens';
import { SourceCard } from './primitives';

export interface DetailViewProps {
  node: MainFlowNode;
  region: Region;
}

interface DetailLayoutProps extends DetailViewProps {
  hero?: React.ReactNode;
  heroLabel?: string;
}

const DetailLayout: React.FC<DetailLayoutProps> = ({ node, region, hero, heroLabel }) => {
  const palette = regionPalette(region);

  return (
    <div
      style={{
        background: color.bg.surface,
        border: `1px solid ${palette.fg}33`,
        borderRadius: radius.xl,
        padding: space[5],
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: palette.fg,
          opacity: 0.6,
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: space[4],
          paddingBottom: space[3],
          borderBottom: `1px solid ${color.border.subtle}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: space[3] }}>
          <span
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: palette.fg,
              letterSpacing: font.letterSpacing.label,
              textTransform: 'uppercase',
              fontWeight: font.weight.bold,
            }}
          >
            {REGION_LABEL[region]}
          </span>
          <span
            style={{
              fontFamily: font.family.sans,
              fontSize: font.size.lg,
              color: color.text.primary,
              fontWeight: font.weight.semibold,
              letterSpacing: font.letterSpacing.tight,
            }}
          >
            {node.title.replace(/\s—\s.*$/, '')}
          </span>
        </div>
        <span
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.muted,
            letterSpacing: font.letterSpacing.wide,
          }}
        >
          Linux 2.6.32 LTS
        </span>
      </div>

      {/* Hero viz */}
      {hero && (
        <div style={{ marginBottom: space[5] }}>
          {heroLabel && (
            <div
              style={{
                fontFamily: font.family.mono,
                fontSize: '9.5px',
                color: color.text.muted,
                letterSpacing: font.letterSpacing.label,
                textTransform: 'uppercase',
                marginBottom: space[2],
              }}
            >
              {heroLabel}
            </div>
          )}
          <div
            style={{
              background: color.bg.canvas,
              border: `1px solid ${color.border.subtle}`,
              borderRadius: radius.lg,
              padding: space[4],
              overflow: 'auto',
            }}
          >
            {hero}
          </div>
        </div>
      )}

      {/* Source refs */}
      {node.detail_nodes.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: font.family.mono,
              fontSize: '9.5px',
              color: color.text.muted,
              letterSpacing: font.letterSpacing.label,
              textTransform: 'uppercase',
              marginBottom: space[2],
            }}
          >
            Source references — {node.detail_nodes.length} kernel anchors
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: space[3],
            }}
          >
            {node.detail_nodes.map(dn => (
              <SourceCard key={dn.id} detailNode={dn} region={region} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailLayout;
