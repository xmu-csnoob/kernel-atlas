import React from 'react';
import { color, font, space, radius } from '../../../design/tokens';
import type { Region } from '../../../design/tokens';
import { regionPalette } from '../../../design/tokens';

interface SyscallTableGridProps {
  entries: { index: number; name: string }[];
  activeIndex: number;
  columns?: number;
  region?: Region;
  label?: string;
}

const SyscallTableGrid: React.FC<SyscallTableGridProps> = ({
  entries,
  activeIndex,
  columns = 8,
  region = 'vfs',
  label,
}) => {
  const palette = regionPalette(region);

  return (
    <div>
      {label && (
        <div
          style={{
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.muted,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: space[2],
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '3px',
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
        }}
      >
        {entries.map((entry) => {
          const active = entry.index === activeIndex;
          return (
            <div
              key={entry.index}
              style={{
                background: active ? palette.fg : color.bg.surface,
                color: active ? color.bg.canvas : color.text.muted,
                fontFamily: font.family.mono,
                fontSize: '8.5px',
                padding: '3px 2px',
                borderRadius: radius.sm,
                border: active
                  ? `1px solid ${color.pulse}`
                  : '1px solid transparent',
                boxShadow: active
                  ? `0 0 12px ${palette.glow}`
                  : 'none',
                fontWeight: active ? 700 : 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={`${entry.index}: ${entry.name}`}
            >
              <span style={{ opacity: 0.5, marginRight: '3px' }}>
                {entry.index}
              </span>
              {entry.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SyscallTableGrid;
