import React from 'react';
import { color, font, space, radius } from '../../../design/tokens';
import type { Region } from '../../../design/tokens';
import { regionPalette } from '../../../design/tokens';

interface BufferBoxProps {
  label: string;
  region: Region;
  size: number;
  filled: number;
  hint?: string;
  animatedFill?: boolean;
}

const BufferBox: React.FC<BufferBoxProps> = ({
  label,
  region,
  size,
  filled,
  hint,
  animatedFill,
}) => {
  const palette = regionPalette(region);
  const pct = (filled / size) * 100;
  return (
    <div
      style={{
        background: palette.bg,
        border: `1px solid ${palette.fg}66`,
        borderRadius: radius.md,
        padding: space[3],
      }}
    >
      <div
        style={{
          fontFamily: font.family.mono,
          fontSize: '9.5px',
          color: palette.fg,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: space[2],
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          height: '16px',
          background: color.bg.surface,
          borderRadius: '2px',
          overflow: 'hidden',
          border: `1px solid ${color.border.subtle}`,
        }}
      >
        <div
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${palette.fg}, ${palette.accent})`,
            width: animatedFill ? '0%' : `${pct}%`,
            animation: animatedFill ? 'bt-fill 1.6s ease-out infinite' : 'none',
          }}
        />
      </div>
      <div
        style={{
          marginTop: space[1],
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: font.family.mono,
          fontSize: '9px',
          color: color.text.muted,
        }}
      >
        <span>{filled} / {size} B</span>
        <span>{hint}</span>
      </div>
    </div>
  );
};

interface BufferTransferProps {
  source: BufferBoxProps;
  target: BufferBoxProps;
  transferLabel?: string;
  transferSubLabel?: string;
  particleCount?: number;
  particleLabel?: string;
}

const BufferTransfer: React.FC<BufferTransferProps> = ({
  source,
  target,
  transferLabel = 'copy',
  transferSubLabel,
  particleCount = 5,
  particleLabel = '4K',
}) => {
  return (
    <div>
      <style>{`
        @keyframes bt-byte-flow {
          0% { transform: translateX(0%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(180%); opacity: 0; }
        }
        @keyframes bt-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 1fr',
          alignItems: 'center',
          gap: space[3],
        }}
      >
        <BufferBox {...source} />

        {/* Animated flow */}
        <div style={{ position: 'relative', height: '72px', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, ${color.region.return.fg}55 50%, transparent 100%)`,
              transform: 'translateY(-50%)',
            }}
          />
          {Array.from({ length: particleCount }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '0%',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '14px',
                height: '14px',
                borderRadius: '2px',
                background: color.region.return.accent,
                boxShadow: `0 0 8px ${color.region.return.glow}`,
                animation: `bt-byte-flow 1.6s ease-in-out infinite`,
                animationDelay: `${i * 0.32}s`,
                fontFamily: font.family.mono,
                fontSize: '7px',
                color: color.bg.canvas,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              {particleLabel}
            </div>
          ))}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '0',
              transform: 'translateX(-50%)',
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.region.return.fg,
              letterSpacing: '0.05em',
              fontWeight: 700,
            }}
          >
            {transferLabel}
          </div>
          {transferSubLabel && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: '0',
                transform: 'translateX(-50%)',
                fontFamily: font.family.mono,
                fontSize: '8.5px',
                color: color.text.dim,
              }}
            >
              {transferSubLabel}
            </div>
          )}
        </div>

        <BufferBox {...target} />
      </div>
    </div>
  );
};

export default BufferTransfer;
