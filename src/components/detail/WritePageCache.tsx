import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import BufferTransfer from './primitives/BufferTransfer';
import { color, font, space, radius } from '../../design/tokens';

// 8 cols × 6 rows = 48 page slots representing a section of the page cache
const PAGE_SLOTS: { state: 'clean' | 'dirty' | 'new_dirty' | 'empty' | 'alloc' }[] = (() => {
  const slots: { state: 'clean' | 'dirty' | 'new_dirty' | 'empty' | 'alloc' }[] = Array.from(
    { length: 48 },
    () => ({ state: 'empty' })
  );
  // Some pre-existing clean pages
  [2, 6, 9, 14, 22, 26, 31, 35, 41, 44].forEach(i => {
    slots[i] = { state: 'clean' };
  });
  // Some existing dirty pages (other writers)
  [5, 18, 33].forEach(i => {
    slots[i] = { state: 'dirty' };
  });
  // Newly allocated page for this write
  slots[17] = { state: 'alloc' };
  // The page being marked dirty by this write
  slots[19] = { state: 'new_dirty' };
  return slots;
})();

export const WritePageCacheHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Buffer transfer: user → kernel */}
    <div>
      <SectionLabel accent={color.region.mm.fg}>
        copy_from_user — 4096 bytes flow from user to kernel page
      </SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: '8px',
          padding: space[4],
        }}
      >
        <BufferTransfer
          source={{
            label: 'user buffer',
            region: 'user',
            size: 4096,
            filled: 4096,
            hint: 'passed by writer',
          }}
          target={{
            label: 'kernel page (page cache)',
            region: 'mm',
            size: 4096,
            filled: 4096,
            hint: 'newly allocated',
            animatedFill: true,
          }}
          transferLabel="copy_from_user"
          transferSubLabel="SW page-fault checked"
          particleCount={5}
          particleLabel="4K"
        />
      </div>
    </div>

    {/* Page cache grid */}
    <div>
      <SectionLabel accent={color.region.mm.fg}>
        page cache (address_space radix tree) — after write · mm/filemap.c
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
              const isNewDirty = slot.state === 'new_dirty';
              const isDirty = slot.state === 'dirty';
              const isClean = slot.state === 'clean';
              const isAlloc = slot.state === 'alloc';
              return (
                <div
                  key={i}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '3px',
                    background: isClean
                      ? color.region.mm.bg
                      : isDirty
                      ? 'rgba(255, 167, 38, 0.18)'
                      : isNewDirty
                      ? 'rgba(239, 83, 80, 0.22)'
                      : isAlloc
                      ? 'rgba(102, 187, 106, 0.18)'
                      : color.bg.surface,
                    border: isNewDirty
                      ? `1px solid ${color.region.hardware.fg}`
                      : isDirty
                      ? `1px solid ${color.accent.warning}`
                      : isClean
                      ? `1px solid ${color.region.mm.fg}55`
                      : isAlloc
                      ? `1px dashed ${color.accent.success}`
                      : `1px solid ${color.border.subtle}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: font.family.mono,
                    fontSize: '9px',
                    color: isNewDirty
                      ? color.region.hardware.fg
                      : isDirty
                      ? color.accent.warning
                      : isClean
                      ? color.region.mm.accent
                      : isAlloc
                      ? color.accent.success
                      : color.text.dim,
                    fontWeight: isNewDirty || isAlloc ? font.weight.bold : font.weight.regular,
                    animation: isNewDirty
                      ? 'dirty-pulse 1.4s ease-in-out infinite'
                      : 'none',
                  }}
                  title={`page #${i}`}
                >
                  {isClean ? '●' : isDirty ? '◐' : isNewDirty ? '◉' : isAlloc ? '+' : ''}
                </div>
              );
            })}
          </div>
          <style>{`
            @keyframes dirty-pulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(239,83,80,0); transform: scale(1); }
              50%      { box-shadow: 0 0 0 4px rgba(239,83,80,0.4); transform: scale(1.06); }
            }
          `}</style>
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
          <LegendRow swatch={color.region.mm.bg} swatchBorder={color.region.mm.fg + '55'} dot="●" label="clean page" />
          <LegendRow swatch="rgba(255, 167, 38, 0.18)" swatchBorder={color.accent.warning} dot="◐" label="dirty (pending writeback)" />
          <LegendRow swatch="rgba(239, 83, 80, 0.22)" swatchBorder={color.region.hardware.fg} dot="◉" label="newly dirtied (this write)" pulse />
          <LegendRow swatch="rgba(102, 187, 106, 0.18)" swatchBorder={color.accent.success} dot="+" label="newly allocated" />
          <LegendRow swatch={color.bg.surface} swatchBorder={color.border.subtle} dot="" label="not present" />
          <div style={{ marginTop: space[2], paddingTop: space[2], borderTop: `1px solid ${color.border.subtle}`, color: color.text.muted }}>
            After copy: <code style={{ color: color.accent.primary }}>set_page_dirty(mapping, 19)</code> marks page dirty
          </div>
        </div>
      </div>
    </div>

    {/* Dirty state struct */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="struct page"
        type="page #19"
        region="mm"
        fields={[
          { label: 'flags', value: 'PG_dirty | PG_uptodate | PG_locked', highlight: true },
          { label: 'mapping', value: '→ address_space (out)' },
          { label: 'index', value: '19' },
          { label: 'count', value: '_count = 2' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.mm.fg}>set_page_dirty flow</SectionLabel>
        <CodeBlock>{`/* After copy_from_user succeeds */
SetPageDirty(page);           // set PG_dirty flag
mark_page_accessed(page);     // move to active LRU

/* Page now waits for writeback thread */
if (nr_dirty > dirty_thresh)
    wakeup_flusher_threads(); // pdflush / bdi`}</CodeBlock>
      </div>
    </div>
  </div>
);

const WritePageCache: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="copy_from_user → page cache → mark dirty"
    hero={<WritePageCacheHero />}
  />
);

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
        animation: pulse ? 'dirty-pulse 1.4s ease-in-out infinite' : 'none',
      }}
    >
      {dot}
    </span>
    <span>{label}</span>
  </div>
);

export default WritePageCache;
