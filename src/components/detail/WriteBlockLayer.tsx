import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const WriteBlockLayerHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Writeback thread flow */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="writeback_control"
        type="wbc"
        region="block"
        fields={[
          { label: 'sync_mode', value: 'WB_SYNC_NONE' },
          { label: 'nr_to_write', value: '1024' },
          { label: 'range_start', value: '0' },
          { label: 'range_end', value: 'LLONG_MAX' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.block.fg}>pdflush / per-bdi writeback</SectionLabel>
        <CodeBlock>{`/* Background writeback thread */
wb_writeback(struct bdi_writeback *wb)
{
    while ((nr_pages = get_nr_dirty_pages()) > dirty_thresh) {
        write_cache_pages(mapping, &wbc,
                          ext2_writepage, NULL);
        // → builds BIOs for dirty pages
    }
}`}</CodeBlock>
      </div>
    </div>

    {/* BIO submission track */}
    <div>
      <SectionLabel accent={color.region.block.fg}>
        block I/O queue (WRITE) · block/blk-core.c · submit_bio
      </SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
          position: 'relative',
          overflow: 'hidden',
          height: '110px',
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
            background: `linear-gradient(90deg, transparent 0%, ${color.accent.warning}33 20%, ${color.accent.warning}33 80%, transparent 100%)`,
            transform: 'translateY(-50%)',
          }}
        />
        {/* Memory endpoint (left) */}
        <div
          style={{
            position: 'absolute',
            left: space[3],
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.region.block.fg,
            background: color.region.block.bg,
            border: `1px solid ${color.region.block.fg}66`,
            padding: `${space[2]} ${space[3]}`,
            borderRadius: radius.md,
          }}
        >
          page cache
        </div>
        {/* Static BIO chips in queue */}
        <div
          style={{
            position: 'absolute',
            left: '22%',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: space[2],
          }}
        >
          <BioChip sector="LBA 0x4280" size="4 KB" status="done" />
          <BioChip sector="LBA 0x4288" size="4 KB" status="processing" />
        </div>
        {/* Animated incoming BIO (from page cache) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%) translateX(-100%)',
            left: '12%',
            width: '180px',
            animation: 'bio-flow-write 3s ease-in-out infinite',
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
        <style>{`
          @keyframes bio-flow-write {
            0%   { transform: translateY(-50%) translateX(-100%); opacity: 0; }
            15%  { opacity: 1; }
            85%  { opacity: 1; }
            100% { transform: translateY(-50%) translateX(350%); opacity: 0; }
          }
        `}</style>
      </div>
    </div>

    {/* I/O scheduler + plugging */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="request_queue"
        type="q"
        region="block"
        fields={[
          { label: 'elevator', value: '→ cfq_queue', highlight: true },
          { label: 'plugged', value: '1 (merging)' },
          { label: 'nr_requests', value: '128' },
          { label: 'queuedata', value: '→ sata driver' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.block.fg}>I/O scheduler — CFQ (write coalescing)</SectionLabel>
        <CodeBlock>{`/* Plugging: merge adjacent writes */
blk_plug_device(q);           // hold requests briefly
elv_merge(q, rq, bio);        // try front/back merge

/* Unplug after timeout or threshold */
__generic_unplug_device(q);   // flush to disk driver`}</CodeBlock>
      </div>
    </div>
  </div>
);

const WriteBlockLayer: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="writeback thread → BIO → I/O scheduler → disk"
    hero={<WriteBlockLayerHero />}
  />
);

const BioChip: React.FC<{ sector: string; size: string; status: 'new' | 'processing' | 'done'; highlight?: boolean }> = ({
  sector,
  size,
  status,
  highlight,
}) => {
  const statusColor =
    status === 'new' ? color.accent.warning :
    status === 'processing' ? color.pulse :
    color.accent.success;
  return (
    <div
      style={{
        background: color.bg.surface,
        border: `1px solid ${highlight ? color.accent.warning : color.border.default}`,
        borderRadius: radius.md,
        padding: `${space[1]} ${space[2]}`,
        fontFamily: font.family.mono,
        fontSize: '10px',
        color: color.text.secondary,
        display: 'flex',
        gap: space[2],
        alignItems: 'center',
        boxShadow: highlight ? `0 0 16px rgba(255,167,38,0.3)` : '0 1px 2px rgba(0,0,0,0.3)',
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

export default WriteBlockLayer;
