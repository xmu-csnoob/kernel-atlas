import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import BufferTransfer from './primitives/BufferTransfer';
import { color, font, space, radius } from '../../design/tokens';

export const IoctlDataCopyHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Two-direction buffer transfer */}
    <div>
      <SectionLabel accent={color.region.vfs.fg}>
        ioctl data flow: user arg → kernel validation → kernel struct → user result
      </SectionLabel>
      <div
        style={{
          display: 'flex',
          gap: space[3],
          flexWrap: 'wrap',
          alignItems: 'stretch',
        }}
      >
        {/* copy_from_user */}
        <div style={{ flex: '1 1 280px' }}>
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
                fontFamily: font.family.mono,
                fontSize: font.size.xs,
                color: color.region.user.fg,
                fontWeight: font.weight.bold,
                letterSpacing: font.letterSpacing.label,
                textTransform: 'uppercase',
                marginBottom: space[2],
              }}
            >
              copy_from_user — TCSETS (user → kernel)
            </div>
            <BufferTransfer
              source={{
                label: 'user arg (struct termios*)',
                region: 'user',
                size: 60,
                filled: 60,
                hint: 'user-space pointer',
              }}
              target={{
                label: 'kernel termios buffer',
                region: 'vfs',
                size: 60,
                filled: 60,
                hint: 'kmalloc or stack',
              }}
              transferLabel="copy_from_user"
              transferSubLabel="access_ok + __copy_from_user"
              particleCount={4}
              particleLabel="60B"
            />
          </div>
        </div>

        {/* copy_to_user */}
        <div style={{ flex: '1 1 280px' }}>
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
                fontFamily: font.family.mono,
                fontSize: font.size.xs,
                color: color.region.return.fg,
                fontWeight: font.weight.bold,
                letterSpacing: font.letterSpacing.label,
                textTransform: 'uppercase',
                marginBottom: space[2],
              }}
            >
              copy_to_user — TCGETS (kernel → user)
            </div>
            <BufferTransfer
              source={{
                label: 'kernel termios buffer',
                region: 'vfs',
                size: 60,
                filled: 60,
                hint: 'tty->termios',
              }}
              target={{
                label: 'user arg (struct termios*)',
                region: 'return',
                size: 60,
                filled: 60,
                hint: 'user-space pointer',
              }}
              transferLabel="copy_to_user"
              transferSubLabel="access_ok + __copy_to_user"
              particleCount={4}
              particleLabel="60B"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Scalar vs struct comparison */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="scalar fast path"
        type="put_user / get_user"
        region="vfs"
        fields={[
          { label: 'int', value: 'movl + access_ok', highlight: true },
          { label: 'long', value: 'movq + access_ok', highlight: true },
          { label: 'pointer', value: 'movq + access_ok', highlight: true },
          { label: 'inline', value: 'yes (macro)' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.vfs.fg}>access_ok() — the gatekeeper</SectionLabel>
        <CodeBlock>{`/* All user-space access goes through access_ok first */
#define access_ok(type, addr, size) ({           \
    __chk_user_ptr(addr);                         \
    (likely(__range_not_ok(addr, size,            \
                           TASK_SIZE) == 0));     \
})

/* x86-64 TASK_SIZE = 0x00007fffffffffff */
/* Rejects kernel addresses passed from user space */`}</CodeBlock>
      </div>
    </div>
  </div>
);

const IoctlDataCopy: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="copy_from_user / copy_to_user — safe user↔kernel transfer" hero={<IoctlDataCopyHero />} />
);

export default IoctlDataCopy;
