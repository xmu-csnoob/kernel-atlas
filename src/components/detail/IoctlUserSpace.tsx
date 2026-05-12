import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import RingBoundaryBanner from './primitives/RingBoundaryBanner';
import { color, font, space, radius } from '../../design/tokens';

export const IoctlUserSpaceHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Request encoding breakdown */}
    <div>
      <SectionLabel accent={color.region.user.fg}>ioctl request code layout (32-bit)</SectionLabel>
      <div
        style={{
          display: 'flex',
          gap: '2px',
          fontFamily: font.family.mono,
          fontSize: font.size.sm,
        }}
      >
        {/* Bit field visualization */}
        {[
          { label: 'dir', bits: '30-31', width: '60px', value: '_IOC_WRITE', color: color.accent.primary },
          { label: 'size', bits: '16-29', width: '120px', value: 'sizeof(termios)', color: color.region.user.fg },
          { label: 'type', bits: '8-15', width: '80px', value: "'T'", color: color.pulse },
          { label: 'nr', bits: '0-7', width: '60px', value: '0x01', color: color.accent.success },
        ].map((field) => (
          <div
            key={field.label}
            style={{
              flex: field.width,
              minWidth: field.width,
              background: `${field.color}15`,
              border: `1px solid ${field.color}55`,
              borderRadius: radius.sm,
              padding: `${space[2]} ${space[3]}`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: font.size.xs, color: color.text.muted, marginBottom: '2px' }}>
              bits {field.bits}
            </div>
            <div style={{ fontSize: font.size.sm, color: field.color, fontWeight: font.weight.bold }}>
              {field.label}
            </div>
            <div style={{ fontSize: font.size.xs, color: color.text.secondary, marginTop: '2px' }}>
              {field.value}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: space[2],
          fontFamily: font.family.mono,
          fontSize: font.size.xs,
          color: color.text.muted,
          textAlign: 'center',
        }}
      >
        TCSETS = _IOC(_IOC_WRITE, 'T', 0x01, sizeof(struct termios)) = 0x00005401
      </div>
    </div>

    {/* Register setup */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="register setup"
        type="x86-64 syscall ABI"
        region="user"
        fields={[
          { label: '%rax', value: '__NR_ioctl (16)', highlight: true },
          { label: '%rdi', value: 'fd = 0 (stdin)', highlight: true },
          { label: '%rsi', value: 'TCSETS (0x5401)', highlight: true },
          { label: '%rdx', value: '&termios (user ptr)', highlight: true },
        ]}
      />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SectionLabel accent={color.region.user.fg}>glibc ioctl() wrapper</SectionLabel>
        <CodeBlock>{`/* User code */
struct termios t;
t.c_lflag |= ECHO;
ioctl(STDIN_FILENO, TCSETS, &t);

/* glibc wrapper — sets up registers and executes syscall */
mov $16, %rax        /* __NR_ioctl */
mov %rdi, fd         /* STDIN_FILENO = 0 */
mov %rsi, TCSETS     /* 0x5401 */
mov %rdx, &t         /* user pointer */
syscall              /* trap to kernel */`}</CodeBlock>
      </div>
    </div>

    {/* Boundary indicator */}
    <RingBoundaryBanner
      fromLabel="USER"
      fromRing="ring 3"
      toLabel="KERNEL"
      toRing="ring 0"
      arrowLabel="ioctl syscall"
    />
  </div>
);

const IoctlUserSpace: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="ioctl request encoding: cmd = _IOC(dir, type, nr, size)" hero={<IoctlUserSpaceHero />} />
);

export default IoctlUserSpace;
