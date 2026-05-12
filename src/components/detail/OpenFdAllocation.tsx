import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const OpenFdAllocationHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* FD bitmap visualization */}
    <div>
      <SectionLabel accent={color.region.process.fg}>
        fdtable bitmap  ·  find_next_zero_bit()  ·  fs/file.c
      </SectionLabel>
      <div
        style={{
          display: 'flex',
          gap: '3px',
          flexWrap: 'wrap',
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
        }}
      >
        {Array.from({ length: 16 }).map((_, i) => {
          const occupied = i === 0 || i === 1 || i === 2;
          const isNew = i === 3;
          return (
            <div
              key={i}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: isNew
                  ? 'rgba(102, 187, 106, 0.2)'
                  : occupied
                  ? color.region.process.bg
                  : color.bg.surface,
                border: `1px solid ${
                  isNew
                    ? color.accent.success
                    : occupied
                    ? color.region.process.fg + '55'
                    : color.border.subtle
                }`,
                boxShadow: isNew
                  ? `0 0 12px rgba(102, 187, 106, 0.3)`
                  : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: font.family.mono,
                  fontSize: '9px',
                  color: color.text.dim,
                }}
              >
                fd={i}
              </span>
              <span
                style={{
                  fontFamily: font.family.mono,
                  fontSize: '10px',
                  color: isNew
                    ? color.accent.success
                    : occupied
                    ? color.region.process.accent
                    : color.text.dim,
                  fontWeight: isNew || occupied ? 700 : 400,
                }}
              >
                {occupied ? '●' : isNew ? 'NEW' : '○'}
              </span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: space[2],
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.muted,
        }}
      >
        fd[0]=stdin, fd[1]=stdout, fd[2]=stderr →{' '}
        <span style={{ color: color.accent.success }}>fd[3] = NEW (allocated)</span>
      </div>
    </div>

    {/* struct file + fd_install flow */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="struct file"
        type="new open file"
        region="process"
        fields={[
          { label: 'f_path.dentry', value: '→ passwd', highlight: true },
          { label: 'f_path.mnt', value: '→ root vfsmount' },
          { label: 'f_op', value: '→ ext2_file_ops' },
          { label: 'f_pos', value: '0' },
          { label: 'f_mode', value: 'FMODE_READ' },
          { label: 'f_count', value: '1' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.process.fg}>fd_install()</SectionLabel>
        <CodeBlock compact>{`void fd_install(unsigned int fd, struct file *file)
{
    struct files_struct *files = current->files;
    struct fdtable *fdt;

    spin_lock(&files->file_lock);
    fdt = files_fdtable(files);
    BUG_ON(fdt->fd[fd] != NULL);
    rcu_assign_pointer(fdt->fd[fd], file);
    spin_unlock(&files->file_lock);
}`}</CodeBlock>
        <div
          style={{
            marginTop: space[2],
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.muted,
          }}
        >
          After fd_install(3, file): user space can call read(3, buf, 4096)
        </div>
      </div>
    </div>
  </div>
);

const OpenFdAllocation: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="fd bitmap → alloc → fd_install(fd, file*)"
    hero={<OpenFdAllocationHero />}
  />
);

export default OpenFdAllocation;
