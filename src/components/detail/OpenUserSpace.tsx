import React from 'react';
import DetailLayout from './DetailLayout';
import type { DetailViewProps } from './DetailLayout';
import { CodeBlock, SectionLabel, StructCard } from './primitives';
import RingBoundaryBanner from './primitives/RingBoundaryBanner';
import { color, space } from '../../design/tokens';

export const OpenUserSpaceHero: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
    {/* Top row: process state + open args */}
    <div style={{ display: 'flex', gap: space[5], flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StructCard
        name="task_struct"
        type="user process"
        region="user"
        fields={[
          { label: 'pid',     value: '1234' },
          { label: 'comm',    value: '"cat"' },
          { label: 'tgid',    value: '1234' },
          { label: '*files',  value: '→ files_struct', highlight: true },
        ]}
      />
      <StructCard
        name="open args"
        type="syscall params"
        region="user"
        fields={[
          { label: 'pathname', value: '"./passwd"', highlight: true },
          { label: 'flags',    value: 'O_RDONLY' },
          { label: 'mode',     value: '0 (ignored)' },
        ]}
      />
      <div style={{ flex: 1, minWidth: '220px' }}>
        <SectionLabel accent={color.region.user.fg}>syscall convention (x86_64)</SectionLabel>
        <CodeBlock>{`mov  $2,      %rax     # __NR_open = 2
lea  pathname, %rdi     # "./passwd"
mov  $0,       %rsi     # flags = O_RDONLY
mov  $0,       %rdx     # mode = 0
syscall                 # → ring 0`}</CodeBlock>
      </div>
    </div>

    {/* Boundary indicator */}
    <RingBoundaryBanner />
  </div>
);

const OpenUserSpace: React.FC<DetailViewProps> = ({ node, region }) => (
  <DetailLayout node={node} region={region} heroLabel="What the user process does" hero={<OpenUserSpaceHero />} />
);

export default OpenUserSpace;
