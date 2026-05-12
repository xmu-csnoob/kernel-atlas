import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import { color, font, space, radius } from '../../design/tokens';

export const IoctlReturnPathHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Return flow chain */}
    <div>
      <SectionLabel accent={color.region.return.fg}>Return value propagation</SectionLabel>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: space[2],
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'driver handler', value: '0', region: 'return' as const },
          { label: '→', value: '', region: 'return' as const, isArrow: true },
          { label: 'unlocked_ioctl', value: '0', region: 'return' as const },
          { label: '→', value: '', region: 'return' as const, isArrow: true },
          { label: 'file_ioctl', value: '0', region: 'return' as const },
          { label: '→', value: '', region: 'return' as const, isArrow: true },
          { label: 'do_vfs_ioctl', value: '0', region: 'return' as const },
          { label: '→', value: '', region: 'return' as const, isArrow: true },
          { label: 'sys_ioctl', value: '0', region: 'return' as const },
          { label: '→', value: '', region: 'return' as const, isArrow: true },
          { label: '%rax', value: '0', region: 'return' as const },
        ].map((item, i) => {
          if (item.isArrow) {
            return (
              <span
                key={i}
                style={{
                  fontFamily: font.family.mono,
                  fontSize: font.size.sm,
                  color: color.text.muted,
                }}
              >
                →
              </span>
            );
          }
          const palette = color.region[item.region];
          return (
            <div
              key={i}
              style={{
                background: `${palette.fg}12`,
                border: `1px solid ${palette.fg}44`,
                borderRadius: radius.md,
                padding: `${space[2]} ${space[3]}`,
                minWidth: '100px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: font.family.mono,
                  fontSize: font.size.xs,
                  color: palette.fg,
                  fontWeight: font.weight.bold,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: font.family.mono,
                  fontSize: font.size.sm,
                  color: item.value === '0' ? color.accent.success : color.text.secondary,
                }}
              >
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Error codes + return */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 240px' }}>
        <SectionLabel accent={color.region.return.fg}>Common ioctl error codes</SectionLabel>
        <div
          style={{
            background: color.bg.inset,
            border: `1px solid ${color.border.subtle}`,
            borderRadius: radius.md,
            padding: space[3],
            fontFamily: font.family.mono,
            fontSize: font.size.xs,
            color: color.text.secondary,
            lineHeight: 1.8,
          }}
        >
          <div><span style={{ color: color.accent.danger }}>-EBADF</span>  invalid file descriptor</div>
          <div><span style={{ color: color.accent.danger }}>-ENOTTY</span> fd has no unlocked_ioctl handler</div>
          <div><span style={{ color: color.accent.danger }}>-EINVAL</span> invalid command or argument</div>
          <div><span style={{ color: color.accent.danger }}>-EFAULT</span> bad user-space pointer</div>
          <div><span style={{ color: color.accent.danger }}>-ENOMEM</span> out of memory</div>
          <div><span style={{ color: color.accent.danger }}>-EACCES</span> permission denied</div>
          <div><span style={{ color: color.accent.danger }}>-ENODEV</span> no such device</div>
        </div>
      </div>

      <StructCard
        name="return value"
        type="rax"
        region="return"
        fields={[
          { label: '%rax', value: '0', highlight: true },
          { label: 'int', value: 'success' },
          { label: 'errno', value: '0' },
        ]}
      />

      <div style={{ flex: 1, minWidth: '240px' }}>
        <SectionLabel accent={color.region.return.fg}>sysret → user space</SectionLabel>
        <CodeBlock>{`/* sys_ioctl return path */
fput_light(filp, fput_needed);   // drop file ref

/* Stack frame restored, sysret instruction → ring 3 */
sysretq                            // user code resumes

/* glibc wrapper returns int to caller */
return (int)rax;                   // 0 = success`}</CodeBlock>
      </div>
    </div>
  </div>
);

const IoctlReturnPath: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="ioctl return: driver result → VFS → syscall exit → user space" hero={<IoctlReturnPathHero />} />
);

export default IoctlReturnPath;
