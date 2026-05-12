import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel } from './primitives';
import StructChain from './patterns/StructChain';
import { color, font, space, radius } from '../../design/tokens';

export const ReadVfsHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    <StructChain
      cards={[
        {
          structName: 'struct file',
          type: "passwd's fd=3",
          region: 'vfs',
          fields: [
            { label: 'f_path.dentry', value: '/etc/passwd' },
            { label: 'f_pos', value: '0' },
            { label: 'f_op', value: '→ ext2_file_ops', highlight: true },
            { label: 'f_mapping', value: '→ address_space' },
          ],
        },
        {
          structName: 'file_operations',
          type: 'ext2_file_ops',
          region: 'vfs',
          fields: [
            { label: '.read', value: 'do_sync_read', highlight: true },
            { label: '.write', value: 'do_sync_write' },
            { label: '.aio_read', value: 'generic_file_aio_read' },
            { label: '.mmap', value: 'generic_file_mmap' },
          ],
        },
        {
          structName: 'do_sync_read',
          type: 'filemap.c',
          region: 'vfs',
          fields: [
            { label: 'init', value: 'kiocb on stack' },
            { label: 'iov', value: '{buf, count}' },
            { label: 'aio_read', value: 'generic_file_aio_read', highlight: true },
            { label: 'returns', value: 'bytes read' },
          ],
        },
      ]}
      arrows={[
        { label: 'f_op', subLabel: 'vfs_read', width: 100 },
        { label: '.read()', subLabel: 'indirect call', width: 100 },
      ]}
    />

    <div>
      <SectionLabel accent={color.region.vfs.fg}>The indirect call pattern</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
          fontFamily: font.family.mono,
          fontSize: font.size.sm,
          color: color.text.secondary,
          lineHeight: 1.7,
        }}
      >
        <span style={{ color: color.region.vfs.accent }}>vfs_read</span>{' '}
        checks <span style={{ color: color.accent.primary }}>file-&gt;f_op-&gt;read</span>{' '}
        ; if non-NULL, calls it via{' '}
        <span style={{ color: color.pulse }}>file-&gt;f_op-&gt;read(file, buf, count, &pos)</span>.
        For ext2, that resolves to{' '}
        <span style={{ color: color.region.vfs.accent }}>do_sync_read</span>, which wraps
        the async read path in a synchronous loop.
      </div>
    </div>
  </div>
);

const ReadVfs: React.FC<DetailViewProps> = ({ node, region }) => {
  return (
    <DetailLayout
      node={node}
      region={region}
      heroLabel="VFS function pointer chase: file → f_op → read"
      hero={<ReadVfsHero />}
    />
  );
};

export default ReadVfs;
