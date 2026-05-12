import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const OpenReturnPathHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Return value + process fd table */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="return value"
        type="rax"
        region="return"
        fields={[
          { label: '%rax', value: '3', highlight: true },
          { label: 'int', value: 'new fd' },
          { label: 'errno', value: '0' },
        ]}
      />
      <StructCard
        name="files_struct"
        type="after open"
        region="return"
        fields={[
          { label: 'fd[0]', value: 'stdin' },
          { label: 'fd[1]', value: 'stdout' },
          { label: 'fd[2]', value: 'stderr' },
          { label: 'fd[3]', value: '→ passwd file*', highlight: true },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.return.fg}>User space usage</SectionLabel>
        <CodeBlock>{`int fd = open("./passwd", O_RDONLY);
// fd == 3

ssize_t n = read(fd, buf, 4096);
// → vfs_read → f_op->read → page cache

close(fd);   // when done
// → fput() drops refcount, may free struct file`}</CodeBlock>
      </div>
    </div>

    {/* Lifecycle note */}
    <div
      style={{
        background: 'rgba(77, 208, 163, 0.06)',
        border: `1px solid ${color.region.return.fg}33`,
        borderRadius: radius.md,
        padding: space[3],
        fontFamily: font.family.sans,
        fontSize: font.size.sm,
        color: color.text.secondary,
        lineHeight: 1.6,
      }}
    >
      <strong style={{ color: color.region.return.fg }}>File descriptor lifecycle:</strong>{' '}
      The fd (3) is valid only for this process. It indexes into{' '}
      <span style={{ color: color.accent.primary }}>current-&gt;files-&gt;fdt-&gt;fd[]</span>,
      which holds a reference-counted pointer to the{' '}
      <span style={{ color: color.accent.primary }}>struct file</span>. The struct file in
      turn holds references to the dentry and (indirectly) the inode. When{' '}
      <span style={{ color: color.accent.primary }}>close(fd)</span> is called,{' '}
      <span style={{ color: color.accent.primary }}>fput()</span> drops the file reference;
      if it reaches zero, the file is freed and the dentry reference is dropped. The inode
      stays cached in the inode cache until memory pressure reclaims it.
    </div>
  </div>
);

const OpenReturnPath: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="fd → %rax → sysretq → user space"
    hero={<OpenReturnPathHero />}
  />
);

export default OpenReturnPath;
