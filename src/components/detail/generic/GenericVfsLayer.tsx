import React from 'react';
import DetailLayout from '../DetailLayout';
import type { DetailViewProps } from '../DetailLayout';
import { StructCard } from '../primitives';
import AnimatedArrow from '../primitives/AnimatedArrow';
import { color, font, space, radius } from '../../../design/tokens';

const GenericVfsLayer: React.FC<DetailViewProps> = ({ node, region }) => {
  // Infer data structures from the node's data_structures list
  const structs = node.data_structures;
  const hasFile = structs.includes('file') || structs.includes('struct file');
  const hasInode = structs.includes('inode') || structs.includes('struct inode');
  const hasDentry = structs.includes('dentry') || structs.includes('struct dentry');

  return (
    <DetailLayout
      node={node}
      region={region}
      heroLabel="VFS abstraction layer"
      hero={
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: space[2],
              flexWrap: 'wrap',
            }}
          >
            {hasFile && (
              <>
                <StructCard
                  name="struct file"
                  type="open file"
                  region="vfs"
                  fields={[
                    { label: 'f_path.dentry', value: '→ dentry' },
                    { label: 'f_op', value: '→ file_operations', highlight: true },
                    { label: 'f_mapping', value: '→ address_space' },
                  ]}
                />
                <AnimatedArrow label="f_op" subLabel="dispatch" width={100} />
              </>
            )}

            <StructCard
              name="file_operations"
              type="VFS ops table"
              region="vfs"
              fields={[
                { label: '.read', value: 'fs-specific', highlight: true },
                { label: '.write', value: 'fs-specific' },
                { label: '.open', value: 'fs-specific' },
                { label: '.mmap', value: 'generic or fs' },
              ]}
            />

            <AnimatedArrow label="op()" subLabel="indirect call" width={100} />

            <StructCard
              name="implementation"
              type="filesystem"
              region="vfs"
              fields={[
                { label: 'func', value: 'ext2/3/4, xfs, ...' },
                { label: 'inode', value: hasInode ? '→ struct inode' : '—' },
                { label: 'dentry', value: hasDentry ? '→ struct dentry' : '—' },
              ]}
            />
          </div>

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
            <span style={{ color: color.region.vfs.accent }}>VFS</span>{' '}
            provides a unified interface. The actual filesystem fills{' '}
            <span style={{ color: color.accent.primary }}>file_operations</span>{' '}
            with its own functions. The kernel calls these via function pointers,
            allowing the same <code>read()</code>/<code>write()</code> path to work
            across ext4, xfs, btrfs, etc.
          </div>
        </div>
      }
    />
  );
};

export default GenericVfsLayer;
