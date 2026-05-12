import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const WriteReturnPathHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Sync mode comparison */}
    <div>
      <SectionLabel accent={color.region.return.fg}>
        write() return semantics
      </SectionLabel>
      <div
        style={{
          display: 'flex',
          gap: space[3],
          flexWrap: 'wrap',
        }}
      >
        {/* Buffered (default) */}
        <div
          style={{
            flex: '1 1 240px',
            background: color.bg.inset,
            border: `1px solid ${color.border.subtle}`,
            borderRadius: radius.md,
            padding: space[3],
          }}
        >
          <div
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.accent.success,
              fontWeight: font.weight.bold,
              letterSpacing: font.letterSpacing.label,
              textTransform: 'uppercase',
              marginBottom: space[2],
            }}
          >
            Buffered (default)
          </div>
          <div style={{ fontSize: font.size.sm, color: color.text.secondary, lineHeight: 1.6 }}>
            Data copied to page cache, pages marked dirty.
            <strong style={{ color: color.text.primary }}> Returns immediately</strong> with
            byte count. Actual disk I/O happens asynchronously via pdflush.
          </div>
          <CodeBlock compact>{`ret = vfs_write(file, buf, 4096, &pos);
// → 4096 (data still in page cache)`}</CodeBlock>
        </div>

        {/* O_SYNC / fsync */}
        <div
          style={{
            flex: '1 1 240px',
            background: color.bg.inset,
            border: `1px solid ${color.region.hardware.fg}44`,
            borderRadius: radius.md,
            padding: space[3],
          }}
        >
          <div
            style={{
              fontFamily: font.family.mono,
              fontSize: font.size.xs,
              color: color.region.hardware.fg,
              fontWeight: font.weight.bold,
              letterSpacing: font.letterSpacing.label,
              textTransform: 'uppercase',
              marginBottom: space[2],
            }}
          >
            O_SYNC / fsync()
          </div>
          <div style={{ fontSize: font.size.sm, color: color.text.secondary, lineHeight: 1.6 }}>
            Caller blocks until dirty pages are flushed and disk
            confirms completion via interrupt.
            <strong style={{ color: color.text.primary }}> Guarantees durability</strong>.
          </div>
          <CodeBlock compact>{`filemap_fdatawrite(mapping);   // submit BIOs
filemap_fdatawait(mapping);    // wait for IRQ
// → 4096 (data on disk media)`}</CodeBlock>
        </div>
      </div>
    </div>

    {/* Return value + register state */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="return value"
        type="rax"
        region="return"
        fields={[
          { label: '%rax',  value: '4096', highlight: true },
          { label: 'ssize_t', value: 'bytes written' },
          { label: 'errno', value: '0' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '320px' }}>
        <SectionLabel accent={color.region.return.fg}>sysret → user space</SectionLabel>
        <CodeBlock>{`/* Inside vfs_write return path */
file_pos_write(file, pos);   // advance f_pos by 4096
fput(file);                  // drop reference

/* Stack frame restored, sysret instruction → ring 3 */
sysretq                       // user code resumes after \`syscall\``}</CodeBlock>
      </div>
    </div>
  </div>
);

const WriteReturnPath: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="Buffered write returns immediately; sync modes block"
    hero={<WriteReturnPathHero />}
  />
);

export default WriteReturnPath;
