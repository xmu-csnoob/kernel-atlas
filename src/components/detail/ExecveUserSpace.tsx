import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { CodeBlock, SectionLabel, StructCard } from './primitives';
import RingBoundaryBanner from './primitives/RingBoundaryBanner';
import { color, font, space, radius } from '../../design/tokens';

export const ExecveUserSpaceHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Top row: process state + args */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="task_struct"
        type="user process"
        region="user"
        fields={[
          { label: 'pid',     value: '1234' },
          { label: 'comm',    value: '"bash"' },
          { label: 'mm',      value: '→ mm_struct (old)' },
          { label: '*files',  value: '→ files_struct' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '220px' }}>
        <SectionLabel accent={color.region.user.fg}>syscall convention (x86_64)</SectionLabel>
        <CodeBlock>{`mov  $59,   %rax     # __NR_execve = 59
lea  path,  %rdi     # "/bin/ls"
lea  argv,  %rsi     # ["ls", "-la", NULL]
lea  envp,  %rdx     # ["PATH=/bin", NULL]
syscall              # → ring 0`}</CodeBlock>
      </div>
    </div>

    {/* argv/envp layout visualization */}
    <div>
      <SectionLabel accent={color.region.user.fg}>User stack layout before syscall</SectionLabel>
      <div
        style={{
          background: color.bg.inset,
          border: `1px solid ${color.border.subtle}`,
          borderRadius: radius.md,
          padding: space[4],
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: font.family.mono, fontSize: '10px' }}>
          {/* argv array */}
          <div style={{ display: 'flex', gap: space[2], alignItems: 'center' }}>
            <span style={{ color: color.text.muted, minWidth: '60px' }}>argv[0]</span>
            <span style={{ color: color.region.user.fg }}>→</span>
            <span style={{ color: color.text.secondary, background: color.bg.surface, padding: '2px 8px', borderRadius: radius.sm, border: `1px solid ${color.border.subtle}` }}>"ls"</span>
          </div>
          <div style={{ display: 'flex', gap: space[2], alignItems: 'center' }}>
            <span style={{ color: color.text.muted, minWidth: '60px' }}>argv[1]</span>
            <span style={{ color: color.region.user.fg }}>→</span>
            <span style={{ color: color.text.secondary, background: color.bg.surface, padding: '2px 8px', borderRadius: radius.sm, border: `1px solid ${color.border.subtle}` }}>"-la"</span>
          </div>
          <div style={{ display: 'flex', gap: space[2], alignItems: 'center' }}>
            <span style={{ color: color.text.muted, minWidth: '60px' }}>argv[2]</span>
            <span style={{ color: color.region.user.fg }}>→</span>
            <span style={{ color: color.text.dim, background: color.bg.surface, padding: '2px 8px', borderRadius: radius.sm, border: `1px solid ${color.border.subtle}` }}>NULL</span>
          </div>
          <div style={{ height: '8px' }} />
          {/* envp array */}
          <div style={{ display: 'flex', gap: space[2], alignItems: 'center' }}>
            <span style={{ color: color.text.muted, minWidth: '60px' }}>envp[0]</span>
            <span style={{ color: color.region.user.fg }}>→</span>
            <span style={{ color: color.text.secondary, background: color.bg.surface, padding: '2px 8px', borderRadius: radius.sm, border: `1px solid ${color.border.subtle}` }}>"PATH=/bin:/usr/bin"</span>
          </div>
          <div style={{ display: 'flex', gap: space[2], alignItems: 'center' }}>
            <span style={{ color: color.text.muted, minWidth: '60px' }}>envp[1]</span>
            <span style={{ color: color.region.user.fg }}>→</span>
            <span style={{ color: color.text.dim, background: color.bg.surface, padding: '2px 8px', borderRadius: radius.sm, border: `1px solid ${color.border.subtle}` }}>NULL</span>
          </div>
        </div>
      </div>
    </div>

    {/* Boundary indicator */}
    <RingBoundaryBanner />
  </div>
);

const ExecveUserSpace: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="glibc execve() → syscall with argv/envp" hero={<ExecveUserSpaceHero />} />
);

export default ExecveUserSpace;
