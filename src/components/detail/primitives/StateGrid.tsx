import React from 'react';
import { color, font, space } from '../../../design/tokens';

interface Slot {
  state: string;
  label?: string;
  animation?: 'pulse' | 'shimmer' | 'none';
}

interface LegendItem {
  state: string;
  label: string;
  color: string;
  borderColor: string;
  dot?: string;
  animation?: 'pulse' | 'shimmer';
}

interface StateGridProps {
  cols: number;
  rows: number;
  slots: Slot[];
  legend: LegendItem[];
  label?: string;
  slotSize?: number;
  gap?: number;
}

const StateGrid: React.FC<StateGridProps> = ({
  cols,
  rows,
  slots,
  legend,
  label,
  slotSize = 28,
  gap = 4,
}) => {
  const stateMap = new Map(legend.map((l) => [l.state, l]));

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
          gridTemplateColumns: `repeat(${cols}, ${slotSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${slotSize}px)`,
          gap: `${gap}px`,
        }}
      >
        {slots.map((slot, i) => {
          const lg = stateMap.get(slot.state);
          const isPulse = slot.animation === 'pulse' || lg?.animation === 'pulse';
          const isShimmer = slot.animation === 'shimmer' || lg?.animation === 'shimmer';
          return (
            <div
              key={i}
              style={{
                width: `${slotSize}px`,
                height: `${slotSize}px`,
                borderRadius: '3px',
                background: lg?.color ?? color.bg.surface,
                border: `1px solid ${lg?.borderColor ?? color.border.subtle}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: font.family.mono,
                fontSize: '9px',
                color: lg ? color.text.secondary : color.text.dim,
                fontWeight: isPulse || isShimmer ? 700 : 400,
                animation: isPulse
                  ? 'state-pulse 1.4s ease-in-out infinite'
                  : isShimmer
                  ? 'state-shimmer 1.6s ease-in-out infinite'
                  : 'none',
              }}
              title={slot.label ?? `slot #${i}`}
            >
              {slot.label ?? lg?.dot ?? ''}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes state-pulse {
          0%, 100% { box-shadow: 0 0 0 0 transparent; transform: scale(1); }
          50% { box-shadow: 0 0 0 3px rgba(239,83,80,0.3); transform: scale(1.04); }
        }
        @keyframes state-shimmer {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.95; }
        }
      `}</style>
    </div>
  );
};

export default StateGrid;
