import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { SectionLabel, StructCard, CodeBlock } from './primitives';
import RingBoundaryBanner from './primitives/RingBoundaryBanner';
import { color, font, space, radius } from '../../design/tokens';

export const ExitUserSpaceHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="task_struct"
        type="user process"
        region="user"
        fields={[
          { label: 'pid', value: '1234' },
          { label: 'state', value: 'TASK_RUNNING' },
          { label: 'mm', value: '→ mm_struct' },
          { label: 'files', value: '→ files_struct' },
          { label: 'signal', value: '→ signal_struct' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '220px' }}>
        <SectionLabel accent={color.region.user.fg}>the exit(status) call</SectionLabel>
        <CodeBlock>{`/* glibc exit() performs cleanup then syscall */
void exit(int status) {
    __run_exit_handlers(status);
    _exit(status);   /* NR_exit_group = 231 */
}

/* _exit() is the raw syscall */
void _exit(int status) {
    INLINE_SYSCALL(exit_group, 1, status);
}`}</CodeBlock>
      </div>
    </div>

    {/* Syscall argument flow */}
    <div>
      <SectionLabel accent={color.region.user.fg}>syscall argument setup (x86-64)</SectionLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4px',
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[3],
        }}
      >
        {[
          { reg: '%rax', val: '231', desc: 'NR_exit_group' },
          { reg: '%rdi', val: 'status', desc: 'exit code (0-255)' },
          { reg: '%rsi', val: '0', desc: 'unused' },
          { reg: '%rdx', val: '0', desc: 'unused' },
        ].map((r) => (
          <div
            key={r.reg}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              padding: `${space[2]} ${space[3]}`,
              borderRadius: radius.sm,
              background: r.reg === '%rax' ? 'rgba(77, 208, 225, 0.08)' : 'transparent',
              border: r.reg === '%rax' ? `1px solid ${color.accent.primary}44` : `1px solid transparent`,
              fontFamily: font.family.mono,
              fontSize: '10px',
            }}
          >
            <span style={{ color: r.reg === '%rax' ? color.accent.primary : color.text.muted, fontWeight: 700 }}>
              {r.reg}
            </span>
            <span style={{ color: color.text.secondary }}>{r.val}</span>
            <span style={{ color: color.text.dim, fontSize: '9px' }}>{r.desc}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Boundary indicator */}
    <RingBoundaryBanner />
  </div>
);

const ExitUserSpace: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout
    node={node}
    region={region}
    heroLabel="glibc exit() → exit_group syscall"
    hero={<ExitUserSpaceHero />}
  />
);

export default ExitUserSpace;
