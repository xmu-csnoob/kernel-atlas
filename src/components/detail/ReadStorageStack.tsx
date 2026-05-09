import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

// 8 cols × 6 rows = 48 page slots representing a section of the page cache
const PAGE_SLOTS: { state: 'filled' | 'empty' | 'miss' | 'incoming' }[] = (() => {
  // Mostly empty for the file we just opened; some other pages cached randomly.
  // The "miss" slot is at index 17 (target page).
  const slots: { state: 'filled' | 'empty' | 'miss' | 'incoming' }[] = Array.from(
    { length: 48 },
    () => ({ state: 'empty' })
  );
  // Sprinkle a few cached pages from other files
  [2, 6, 9, 14, 22, 26, 31, 35, 41, 44].forEach(i => {
    slots[i] = { state: 'filled' };
  });
  // Target page (cache miss)
  slots[17] = { state: 'miss' };
  // The page that DMA will deliver shortly
  slots[19] = { state: 'incoming' };
  return slots;
})();

const ReadStorageStack: React.FC<DetailViewProps> = ({ node, region }) => {
  return (
    <DetailLayout
      node={node}
      region={region}
      heroLabel="page cache lookup → cache miss → BIO submission"
      hero={
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
          <style>{`
            @keyframes miss-pulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(239,83,80,0); transform: scale(1); }
              50%      { box-shadow: 0 0 0 4px rgba(239,83,80,0.4); transform: scale(1.06); }
            }
            @keyframes incoming-shimmer {
              0%, 100% { opacity: 0.35; }
              50%      { opacity: 0.95; }
            }
            @keyframes bio-flow {
              0%   { transform: translateX(-100%); opacity: 0; }
              15%  { opacity: 1; }
              85%  { opacity: 1; }
              100% { transform: translateX(140%); opacity: 0; }
            }
          `}</style>

          {/* Page cache grid */}
          <div>
            <SectionLabel accent={color.region.kernel.fg}>
              page cache (address_space radix tree)  ·  mm/filemap.c
            </SectionLabel>
            <div
              style={{
                display: 'flex',
                gap: space[5],
                flexWrap: 'wrap',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  background: color.bg.inset,
                  border: `1px solid ${color.border.subtle}`,
                  borderRadius: radius.md,
                  padding: space[3],
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 28px)',
                    gridTemplateRows: 'repeat(6, 28px)',
                    gap: '4px',
                  }}
                >
                  {PAGE_SLOTS.map((slot, i) => {
                    const isMiss = slot.state === 'miss';
                    const isFilled = slot.state === 'filled';
                    const isIncoming = slot.state === 'incoming';
                    return (
                      <div
                        key={i}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '3px',
                          background: isFilled
                            ? color.region.kernel.bg
                            : isMiss
                            ? 'rgba(239, 83, 80, 0.18)'
                            : isIncoming
                            ? 'rgba(102, 187, 106, 0.18)'
                            : color.bg.surface,
                          border: isMiss
                            ? `1px solid ${color.region.hardware.fg}`
                            : isFilled
                            ? `1px solid ${color.region.kernel.fg}55`
                            : isIncoming
                            ? `1px dashed ${color.accent.success}`
                            : `1px solid ${color.border.subtle}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: font.family.mono,
                          fontSize: '9px',
                          color: isMiss
                            ? color.region.hardware.fg
                            : isFilled
                            ? color.region.kernel.accent
                            : isIncoming
                            ? color.accent.success
                            : color.text.dim,
                          fontWeight: isMiss || isIncoming ? font.weight.bold : font.weight.regular,
                          animation: isMiss
                            ? 'miss-pulse 1.4s ease-in-out infinite'
                            : isIncoming
                            ? 'incoming-shimmer 1.6s ease-in-out infinite'
                            : 'none',
                        }}
                        title={`page #${i}`}
                      >
                        {isFilled ? '●' : isMiss ? '?' : isIncoming ? '↓' : ''}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: space[2],
                  fontFamily: font.family.mono,
                  fontSize: font.size.xs,
                  color: color.text.secondary,
                  minWidth: '220px',
                }}
              >
                <LegendRow swatch={color.region.kernel.bg} swatchBorder={color.region.kernel.fg + '55'} dot="●" label="page in cache" />
                <LegendRow swatch="rgba(239, 83, 80, 0.18)" swatchBorder={color.region.hardware.fg} dot="?" label="miss — must fetch" pulse />
                <LegendRow swatch="rgba(102, 187, 106, 0.18)" swatchBorder={color.accent.success} dot="↓" label="incoming via DMA" />
                <LegendRow swatch={color.bg.surface} swatchBorder={color.border.subtle} dot="" label="not present" />
                <div style={{ marginTop: space[2], paddingTop: space[2], borderTop: `1px solid ${color.border.subtle}`, color: color.text.muted }}>
                  Lookup: <code style={{ color: color.accent.primary }}>find_get_page(mapping, 17)</code> returns NULL → cache miss → readpage()
                </div>
              </div>
            </div>
          </div>

          {/* BIO submission */}
          <div>
            <SectionLabel accent={color.region.kernel.fg}>
              block I/O queue  ·  block/blk-core.c  ·  submit_bio
            </SectionLabel>
            <div
              style={{
                background: color.bg.inset,
                border: `1px solid ${color.border.subtle}`,
                borderRadius: radius.md,
                padding: space[3],
                position: 'relative',
                overflow: 'hidden',
                height: '92px',
              }}
            >
              {/* Track */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  height: '2px',
                  background: `linear-gradient(90deg, transparent 0%, ${color.region.kernel.fg}33 20%, ${color.region.kernel.fg}33 80%, transparent 100%)`,
                  transform: 'translateY(-50%)',
                }}
              />
              {/* Static BIO chips already in queue */}
              <div
                style={{
                  position: 'absolute',
                  left: '8%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  gap: space[2],
                }}
              >
                <BioChip sector="LBA 0x4280" size="4 KB" status="done" />
                <BioChip sector="LBA 0x4288" size="4 KB" status="processing" />
              </div>
              {/* Animated incoming BIO */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%) translateX(-100%)',
                  left: '0%',
                  width: '180px',
                  animation: 'bio-flow 3s ease-in-out infinite',
                }}
              >
                <BioChip sector="LBA 0x4290" size="4 KB" status="new" highlight />
              </div>
              {/* Disk endpoint */}
              <div
                style={{
                  position: 'absolute',
                  right: space[3],
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: font.family.mono,
                  fontSize: font.size.xs,
                  color: color.region.hardware.fg,
                  background: color.region.hardware.bg,
                  border: `1px solid ${color.region.hardware.fg}66`,
                  padding: `${space[2]} ${space[3]}`,
                  borderRadius: radius.md,
                }}
              >
                ▣ disk
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};

const LegendRow: React.FC<{
  swatch: string;
  swatchBorder: string;
  dot: string;
  label: string;
  pulse?: boolean;
}> = ({ swatch, swatchBorder, dot, label, pulse }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: space[2] }}>
    <span
      style={{
        width: '20px',
        height: '20px',
        background: swatch,
        border: `1px solid ${swatchBorder}`,
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        animation: pulse ? 'miss-pulse 1.4s ease-in-out infinite' : 'none',
      }}
    >
      {dot}
    </span>
    <span>{label}</span>
  </div>
);

const BioChip: React.FC<{ sector: string; size: string; status: 'new' | 'processing' | 'done'; highlight?: boolean }> = ({
  sector,
  size,
  status,
  highlight,
}) => {
  const statusColor =
    status === 'new' ? color.pulse :
    status === 'processing' ? color.accent.warning :
    color.accent.success;
  return (
    <div
      style={{
        background: color.bg.surface,
        border: `1px solid ${highlight ? color.pulse : color.border.default}`,
        borderRadius: radius.md,
        padding: `${space[1]} ${space[2]}`,
        fontFamily: font.family.mono,
        fontSize: '10px',
        color: color.text.secondary,
        display: 'flex',
        gap: space[2],
        alignItems: 'center',
        boxShadow: highlight ? `0 0 16px ${color.pulseGlow}` : '0 1px 2px rgba(0,0,0,0.3)',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color: statusColor, fontWeight: 700 }}>BIO</span>
      <span>{sector}</span>
      <span style={{ color: color.text.dim }}>·</span>
      <span>{size}</span>
      <span style={{ color: statusColor, fontSize: '9px' }}>● {status}</span>
    </div>
  );
};

export default ReadStorageStack;
